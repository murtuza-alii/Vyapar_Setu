/**
 * Vyapar Setu (व्यापार सेतु) - Standalone E2E & Foundation Test Runner
 * 
 * Features:
 * - Zero external test framework dependencies (runs natively via Node / tsx)
 * - Structured colored CLI reporting with emojis & ANSI codes
 * - Comprehensive assertion helpers (assertEqual, assertDeepEqual, assertThrows, etc.)
 * - Lifecycle hooks (beforeAll, afterAll, beforeEach, afterEach)
 * - Suite & Test filtering via CLI flags (--filter, --suite)
 * - High-precision execution timing
 * - Strict exit code 0 (all pass) / 1 (any failure) semantics
 */

import * as process from 'node:process';
import * as path from 'node:path';

// --- ANSI Color Formatting ---
export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// --- Test State & Types ---
export type TestFn = () => void | Promise<void>;
export type HookFn = () => void | Promise<void>;

export interface TestCase {
  name: string;
  fn: TestFn;
  skip?: boolean;
  durationMs?: number;
  error?: Error;
  status?: 'PASSED' | 'FAILED' | 'SKIPPED';
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
  beforeAllHooks: HookFn[];
  afterAllHooks: HookFn[];
  beforeEachHooks: HookFn[];
  afterEachHooks: HookFn[];
}

class TestRegistry {
  private suites: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;
  private filterPattern: RegExp | null = null;
  private suitePattern: RegExp | null = null;

  constructor() {
    this.parseCliArgs();
  }

  private parseCliArgs() {
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--filter=')) {
        this.filterPattern = new RegExp(arg.substring(9), 'i');
      } else if (arg === '-f' && i + 1 < args.length) {
        this.filterPattern = new RegExp(args[++i], 'i');
      } else if (arg.startsWith('--suite=')) {
        this.suitePattern = new RegExp(arg.substring(8), 'i');
      } else if (arg === '-s' && i + 1 < args.length) {
        this.suitePattern = new RegExp(args[++i], 'i');
      }
    }
  }

  public describe(name: string, fn: () => void) {
    const suite: TestSuite = {
      name,
      tests: [],
      beforeAllHooks: [],
      afterAllHooks: [],
      beforeEachHooks: [],
      afterEachHooks: [],
    };

    const previousSuite = this.currentSuite;
    this.currentSuite = suite;
    this.suites.push(suite);

    try {
      fn();
    } finally {
      this.currentSuite = previousSuite;
    }
  }

  public test(name: string, fn: TestFn, options?: { skip?: boolean }) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => {
        this.test(name, fn, options);
      });
      return;
    }
    this.currentSuite.tests.push({
      name,
      fn,
      skip: options?.skip ?? false,
    });
  }

  public beforeAll(fn: HookFn) {
    if (this.currentSuite) this.currentSuite.beforeAllHooks.push(fn);
  }

  public afterAll(fn: HookFn) {
    if (this.currentSuite) this.currentSuite.afterAllHooks.push(fn);
  }

  public beforeEach(fn: HookFn) {
    if (this.currentSuite) this.currentSuite.beforeEachHooks.push(fn);
  }

  public afterEach(fn: HookFn) {
    if (this.currentSuite) this.currentSuite.afterEachHooks.push(fn);
  }

  public async run(): Promise<boolean> {
    console.log(`\n${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.yellow}   व्यापार सेतु (VYAPAR SETU) - AUTOMATED E2E & TEST SUITE RUNNER${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);

    const startTime = performance.now();
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;

    const filteredSuites = this.suites.filter(s => 
      !this.suitePattern || this.suitePattern.test(s.name)
    );

    for (const suite of filteredSuites) {
      const filteredTests = suite.tests.filter(t => 
        !this.filterPattern || this.filterPattern.test(t.name)
      );

      if (filteredTests.length === 0) continue;

      console.log(`${colors.bold}${colors.blue}▶ Suite: ${suite.name}${colors.reset}`);

      // Run beforeAll
      for (const hook of suite.beforeAllHooks) {
        try {
          await hook();
        } catch (err: any) {
          console.error(`  ${colors.red}✗ beforeAll hook failed: ${err.message}${colors.reset}`);
        }
      }

      for (const t of filteredTests) {
        totalTests++;
        if (t.skip) {
          skippedTests++;
          t.status = 'SKIPPED';
          console.log(`  ${colors.yellow}⚠ [SKIP]${colors.reset} ${t.name}`);
          continue;
        }

        // Run beforeEach
        for (const hook of suite.beforeEachHooks) {
          try {
            await hook();
          } catch (err: any) {
            console.error(`  ${colors.red}✗ beforeEach hook failed: ${err.message}${colors.reset}`);
          }
        }

        const tStart = performance.now();
        try {
          await t.fn();
          const tDuration = performance.now() - tStart;
          t.durationMs = Math.round(tDuration * 100) / 100;
          t.status = 'PASSED';
          passedTests++;
          console.log(`  ${colors.green}✓ [PASS]${colors.reset} ${t.name} ${colors.dim}(${t.durationMs}ms)${colors.reset}`);
        } catch (err: any) {
          const tDuration = performance.now() - tStart;
          t.durationMs = Math.round(tDuration * 100) / 100;
          t.status = 'FAILED';
          t.error = err;
          failedTests++;
          console.log(`  ${colors.red}✗ [FAIL]${colors.reset} ${t.name} ${colors.dim}(${t.durationMs}ms)${colors.reset}`);
          console.log(`     ${colors.red}${err.name || 'AssertionError'}: ${err.message}${colors.reset}`);
          if (err.stack) {
            const cleanStack = err.stack.split('\n').slice(1, 4).map((l: string) => `     ${colors.dim}${l.trim()}${colors.reset}`).join('\n');
            console.log(cleanStack);
          }
        }

        // Run afterEach
        for (const hook of suite.afterEachHooks) {
          try {
            await hook();
          } catch (err: any) {
            console.error(`  ${colors.red}✗ afterEach hook failed: ${err.message}${colors.reset}`);
          }
        }
      }

      // Run afterAll
      for (const hook of suite.afterAllHooks) {
        try {
          await hook();
        } catch (err: any) {
          console.error(`  ${colors.red}✗ afterAll hook failed: ${err.message}${colors.reset}`);
        }
      }
      console.log('');
    }

    const totalDuration = Math.round((performance.now() - startTime) * 100) / 100;

    // --- Report Summary Card ---
    console.log(`${colors.bold}${colors.cyan}----------------------------------------------------------------------${colors.reset}`);
    console.log(`${colors.bold}SUMMARY REPORT:${colors.reset}`);
    console.log(`  Total Suites:  ${filteredSuites.length}`);
    console.log(`  Total Tests:   ${totalTests}`);
    console.log(`  ${colors.green}Passed:        ${passedTests}${colors.reset}`);
    console.log(`  ${colors.red}Failed:        ${failedTests}${colors.reset}`);
    console.log(`  ${colors.yellow}Skipped:       ${skippedTests}${colors.reset}`);
    console.log(`  Execution Time: ${totalDuration}ms`);
    console.log(`${colors.bold}${colors.cyan}----------------------------------------------------------------------${colors.reset}`);

    if (failedTests === 0 && totalTests > 0) {
      console.log(`${colors.bold}${colors.bgGreen}${colors.white} ALL TESTS PASSED SUCCESSFULLY (100% GREEN) ${colors.reset}\n`);
      return true;
    } else if (totalTests === 0) {
      console.log(`${colors.bold}${colors.yellow} NO TESTS EXECUTED ${colors.reset}\n`);
      return true;
    } else {
      console.log(`${colors.bold}${colors.bgRed}${colors.white} TEST RUN FAILED (${failedTests} test(s) failed) ${colors.reset}\n`);
      return false;
    }
  }
}

// Global Registry Singleton
export const registry = new TestRegistry();

export const describe = (name: string, fn: () => void) => registry.describe(name, fn);
export const test = (name: string, fn: TestFn, options?: { skip?: boolean }) => registry.test(name, fn, options);
export const it = test;
export const beforeAll = (fn: HookFn) => registry.beforeAll(fn);
export const afterAll = (fn: HookFn) => registry.afterAll(fn);
export const beforeEach = (fn: HookFn) => registry.beforeEach(fn);
export const afterEach = (fn: HookFn) => registry.afterEach(fn);

// ============================================================================
// ASSERTION LIBRARY
// ============================================================================

export class AssertionError extends Error {
  actual: any;
  expected: any;
  constructor(message: string, actual?: any, expected?: any) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const val of a) if (!b.has(val)) return false;
    return true;
  }

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, val] of a) {
      if (!b.has(key) || !deepEqual(val, b.get(key))) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) return false;
  }
  return true;
}

export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new AssertionError(
      message || `Expected values to be strictly equal (===).\n  Actual:   ${JSON.stringify(actual)}\n  Expected: ${JSON.stringify(expected)}`,
      actual,
      expected
    );
  }
}

export function assertNotEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual === expected) {
    throw new AssertionError(
      message || `Expected values NOT to be strictly equal (!==). Both are: ${JSON.stringify(actual)}`,
      actual,
      expected
    );
  }
}

export function assertTrue(value: unknown, message?: string): void {
  if (value !== true) {
    throw new AssertionError(message || `Expected true, but received: ${JSON.stringify(value)}`, value, true);
  }
}

export function assertFalse(value: unknown, message?: string): void {
  if (value !== false) {
    throw new AssertionError(message || `Expected false, but received: ${JSON.stringify(value)}`, value, false);
  }
}

export function assertDeepEqual(actual: unknown, expected: unknown, message?: string): void {
  if (!deepEqual(actual, expected)) {
    throw new AssertionError(
      message || `Expected deep equality.\n  Actual:   ${JSON.stringify(actual, null, 2)}\n  Expected: ${JSON.stringify(expected, null, 2)}`,
      actual,
      expected
    );
  }
}

export function assertThrows(
  fn: () => unknown,
  expectedError?: RegExp | string | ErrorConstructor,
  message?: string
): void {
  let thrown = false;
  let caughtError: any = null;
  try {
    fn();
  } catch (err: any) {
    thrown = true;
    caughtError = err;
  }

  if (!thrown) {
    throw new AssertionError(message || 'Expected function to throw an error, but it returned normally.');
  }

  if (expectedError) {
    if (typeof expectedError === 'function') {
      if (!(caughtError instanceof expectedError)) {
        throw new AssertionError(
          `Expected thrown error to be instance of ${expectedError.name}, but caught ${caughtError.name || caughtError}`
        );
      }
    } else if (expectedError instanceof RegExp) {
      if (!expectedError.test(caughtError.message || String(caughtError))) {
        throw new AssertionError(
          `Expected error message matching ${expectedError}, but got "${caughtError.message || caughtError}"`
        );
      }
    } else if (typeof expectedError === 'string') {
      if (!String(caughtError.message || caughtError).includes(expectedError)) {
        throw new AssertionError(
          `Expected error message to contain "${expectedError}", but got "${caughtError.message || caughtError}"`
        );
      }
    }
  }
}

export async function assertThrowsAsync(
  fn: () => Promise<unknown>,
  expectedError?: RegExp | string | ErrorConstructor,
  message?: string
): Promise<void> {
  let thrown = false;
  let caughtError: any = null;
  try {
    await fn();
  } catch (err: any) {
    thrown = true;
    caughtError = err;
  }

  if (!thrown) {
    throw new AssertionError(message || 'Expected async function to throw an error, but it resolved.');
  }

  if (expectedError) {
    if (typeof expectedError === 'function') {
      if (!(caughtError instanceof expectedError)) {
        throw new AssertionError(
          `Expected thrown error to be instance of ${expectedError.name}, but caught ${caughtError.name || caughtError}`
        );
      }
    } else if (expectedError instanceof RegExp) {
      if (!expectedError.test(caughtError.message || String(caughtError))) {
        throw new AssertionError(
          `Expected error message matching ${expectedError}, but got "${caughtError.message || caughtError}"`
        );
      }
    } else if (typeof expectedError === 'string') {
      if (!String(caughtError.message || caughtError).includes(expectedError)) {
        throw new AssertionError(
          `Expected error message to contain "${expectedError}", but got "${caughtError.message || caughtError}"`
        );
      }
    }
  }
}

export function assertDefined<T>(value: T | null | undefined, message?: string): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new AssertionError(message || `Expected value to be defined and non-null, but received: ${value}`, value);
  }
}

export function assertNull(value: unknown, message?: string): void {
  if (value !== null) {
    throw new AssertionError(message || `Expected null, but received: ${JSON.stringify(value)}`, value, null);
  }
}

export function assertCloseTo(actual: number, expected: number, tolerance: number = 0.001, message?: string): void {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new AssertionError(
      message || `Expected ${actual} to be within ${tolerance} of ${expected} (diff was ${diff})`,
      actual,
      expected
    );
  }
}

export function assertMatch(actual: string, regex: RegExp, message?: string): void {
  if (!regex.test(actual)) {
    throw new AssertionError(
      message || `Expected "${actual}" to match regular expression ${regex}`,
      actual,
      regex.source
    );
  }
}

export function assertBetween(actual: number, min: number, max: number, message?: string): void {
  if (actual < min || actual > max) {
    throw new AssertionError(
      message || `Expected ${actual} to be between ${min} and ${max}`,
      actual,
      { min, max }
    );
  }
}

export function assertLength(collection: any[] | string | Set<any> | Map<any, any>, length: number, message?: string): void {
  const actualLength = Array.isArray(collection) || typeof collection === 'string'
    ? collection.length
    : (collection as Set<any> | Map<any, any>).size;
  if (actualLength !== length) {
    throw new AssertionError(
      message || `Expected collection length to be ${length}, but got ${actualLength}`,
      actualLength,
      length
    );
  }
}

export function assertIncludes(collection: any[] | string, item: any, message?: string): void {
  if (typeof collection === 'string') {
    if (!collection.includes(item)) {
      throw new AssertionError(
        message || `Expected string "${collection}" to include "${item}"`,
        collection,
        item
      );
    }
  } else {
    if (!collection.includes(item)) {
      throw new AssertionError(
        message || `Expected array to include item: ${JSON.stringify(item)}`,
        collection,
        item
      );
    }
  }
}

// --- Runner Entrypoint ---
async function main() {
  // If run directly via CLI (npx tsx tests/test-runner.ts), auto-load test suites
  const isDirectRun = process.argv[1]?.includes('test-runner');
  if (isDirectRun) {
    try {
      // Dynamic import of test suites in tests directory
      const suiteArgs = process.argv.slice(2).filter(a => !a.startsWith('-'));
      
      if (suiteArgs.length > 0) {
        for (const file of suiteArgs) {
          const resolvedPath = path.resolve(process.cwd(), file);
          await import(resolvedPath);
        }
      } else {
        // Load Tier 1, 2, 3, 4 suites
        await import('./tier1-feature-coverage.test.js').catch(async () => {
          await import('./tier1-feature-coverage.test.ts');
        });
        await import('./tier2-boundary-corner.test.js').catch(async () => {
          await import('./tier2-boundary-corner.test.ts');
        });
        await import('./tier3-cross-feature.test.js').catch(async () => {
          await import('./tier3-cross-feature.test.ts');
        });
        await import('./tier4-real-world.test.js').catch(async () => {
          await import('./tier4-real-world.test.ts');
        });
      }

      const success = await registry.run();
      process.exit(success ? 0 : 1);
    } catch (err: any) {
      console.error(`${colors.red}Fatal Error in Test Execution:${colors.reset}`, err);
      process.exit(1);
    }
  }
}

main();
