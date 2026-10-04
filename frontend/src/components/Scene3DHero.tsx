import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TradeMode } from '../types';

interface Scene3DHeroProps {
  tradeMode: TradeMode;
  totalReceivables: number;
  totalOrders: number;
}

export const Scene3DHero: React.FC<Scene3DHeroProps> = ({
  tradeMode,
  totalReceivables,
  totalOrders,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Group to hold dynamic geometry
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);

    // Particle field / Constellation
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const baseColor = tradeMode === 'TEXTILE' ? new THREE.Color('#f59e0b') : new THREE.Color('#38bdf8');
    const altColor = new THREE.Color('#10b981');

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2.4 + Math.random() * 1.8;

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = baseColor.clone().lerp(altColor, Math.random() * 0.5);
      particleColors[i * 3] = mixed.r;
      particleColors[i * 3 + 1] = mixed.g;
      particleColors[i * 3 + 2] = mixed.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Dynamic Central 3D Geometry
    let mainMesh: THREE.Mesh;
    let innerMesh: THREE.Mesh;

    if (tradeMode === 'TEXTILE') {
      // Elegant woven TorusKnot representing continuous fine yarn/fabric roll
      const torusGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 32, 2, 3);
      const torusMat = new THREE.MeshStandardMaterial({
        color: '#f59e0b',
        roughness: 0.25,
        metalness: 0.85,
        wireframe: false,
      });
      mainMesh = new THREE.Mesh(torusGeo, torusMat);

      // Inner wireframe glow
      const wireMat = new THREE.MeshBasicMaterial({
        color: '#fbbf24',
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      });
      innerMesh = new THREE.Mesh(torusGeo, wireMat);
      innerMesh.scale.set(1.02, 1.02, 1.02);
    } else {
      // Geometric Precision Icosahedron representing architectural structural engineering
      const icoGeo = new THREE.IcosahedronGeometry(1.3, 1);
      const icoMat = new THREE.MeshStandardMaterial({
        color: '#0ea5e9',
        roughness: 0.2,
        metalness: 0.9,
        flatShading: true,
      });
      mainMesh = new THREE.Mesh(icoGeo, icoMat);

      const wireMat = new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      innerMesh = new THREE.Mesh(icoGeo, wireMat);
      innerMesh.scale.set(1.08, 1.08, 1.08);
    }

    meshGroup.add(mainMesh);
    meshGroup.add(innerMesh);

    // Orbital Ring representing pan-india transit loop
    const ringGeo = new THREE.TorusGeometry(2.1, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: tradeMode === 'TEXTILE' ? '#fbbf24' : '#38bdf8',
      transparent: true,
      opacity: 0.3,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    scene.add(ringMesh);

    // Cinematic Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const primaryLight = new THREE.DirectionalLight(tradeMode === 'TEXTILE' ? 0xffb703 : 0x38bdf8, 3.5);
    primaryLight.position.set(5, 5, 4);
    scene.add(primaryLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 2.5);
    rimLight.position.set(-5, -3, -2);
    scene.add(rimLight);

    // Interactive mouse / gyroscope sway
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.45;
      targetY = y * 0.35;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Damped mouse follow
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;

        meshGroup.rotation.y = elapsed * 0.4 + currentX;
        meshGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.2 + currentY;
        
        innerMesh.rotation.y = -elapsed * 0.2;
        innerMesh.rotation.z = elapsed * 0.15;

        ringMesh.rotation.z = elapsed * 0.15;
        particles.rotation.y = elapsed * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      mainMesh.geometry.dispose();
      (mainMesh.material as THREE.Material).dispose();
      innerMesh.geometry.dispose();
      (innerMesh.material as THREE.Material).dispose();
      ringGeo.dispose();
      ringMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [tradeMode]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800/80 bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-slate-950 shadow-2xl">
      {/* Background radial glow */}
      <div 
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{
          background: tradeMode === 'TEXTILE' ? 'radial-gradient(circle, #f59e0b, transparent)' : 'radial-gradient(circle, #0284c7, transparent)',
        }}
      />
      
      {/* 3D WebGL Canvas Layer */}
      <div 
        ref={mountRef} 
        className="w-full h-48 sm:h-56 md:h-64 cursor-grab active:cursor-grabbing"
      />

      {/* Floating HUD Telemetry Overlay */}
      <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-900/80 border border-slate-700/60 text-slate-200 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute"></span>
              {tradeMode === 'TEXTILE' ? 'SURAT & BHILWARA FABRIC PIPELINE' : 'NATIONAL CEMENT & TMT WEIGHBRIDGE'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono tracking-wider font-semibold text-slate-400 bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              WEBGL 60FPS • DUAL-CORE HARDWARE ACCELERATED
            </span>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent pt-4 rounded-xl">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-0.5">
              Live Network Working Capital
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                ₹{totalReceivables.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-400">
                +14.2% velocity
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800/80 backdrop-blur-md">
              <span className="text-slate-500 block text-[10px]">ACTIVE CONTRACTS</span>
              <span className="text-white font-bold">{totalOrders} Deals in Transit</span>
            </div>
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800/80 backdrop-blur-md">
              <span className="text-slate-500 block text-[10px]">LEDGER STATUS</span>
              <span className="text-emerald-400 font-bold">100% Invariant Match</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
