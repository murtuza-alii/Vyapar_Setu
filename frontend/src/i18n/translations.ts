import { Language } from '../types';

export interface Translations {
  // Brand & Header
  brandTitle: string;
  brandSubtitle: string;
  mandiLive: string;
  firmName: string;
  firmLocation: string;
  textileMode: string;
  buildingMode: string;
  textileModeIndicator: string;
  buildingModeIndicator: string;
  roleLabel: string;
  roleOwner: string;
  roleMunim: string;
  roleGodown: string;
  cashInHand: string;
  bankBalance: string;
  resetDemoData: string;
  resetConfirm: string;
  resetSuccess: string;

  // Tabs
  tabCockpit: string;
  tabCockpitSub: string;
  tabControlTower: string;
  tabControlTowerSub: string;
  tabNetwork: string;
  tabNetworkSub: string;
  tabLedger: string;
  tabLedgerSub: string;

  // Cockpit Top Briefing
  totalReceivables: string;
  totalReceivablesSub: string;
  criticalOverdue: string;
  criticalOverdueSub: string;
  todaysPayables: string;
  todaysPayablesSub: string;
  deadStockCapital: string;
  deadStockCapitalSub: string;

  // Radar
  receivablesRadar: string;
  receivablesRadarSub: string;
  allBucket: string;
  days30Plus: string;
  days15To30: string;
  days0To15: string;
  criticalBadge: string;
  lastPayment: string;
  sendWhatsApp: string;

  // Quick dictation & NLP
  quickDictateTitle: string;
  quickDictateSub: string;
  aiParserActive: string;
  quickSamplesLabel: string;
  dictatePlaceholder: string;
  listeningNotice: string;
  stopListening: string;
  startSpeaking: string;
  parseAndDraft: string;
  twoStepInvariant: string;
  verifyDraft: string;
  confidence: string;
  party: string;
  type: string;
  itemLot: string;
  qtyRate: string;
  cashPaid: string;
  balanceDue: string;
  commitToKhata: string;
  cancel: string;
  committedSuccess: string;

  // Reminder Modal
  reminderPreview: string;
  recipient: string;
  copied: string;
  copyMessage: string;
  sendViaWhatsApp: string;

  // Dead Stock
  deadStockTitle: string;
  deadStockSub: string;
  deadStockDays: string;
  broadcastDiscount: string;

  // Control Tower
  stages: {
    SAUDA_CONFIRMED: string;
    CREDIT_VERIFIED: string;
    STOCK_PICKING: string;
    DISPATCHED: string;
    DELIVERED_CHECK: string;
    SETTLED: string;
  };
  filterAll: string;
  newDealBtn: string;
  dealNumber: string;
  activeDealsTitle: string;
  dealsAvailable: string;
  advanceCTA: string;
  dispatchDetails: string;
  truckNo: string;
  driver: string;
  carrier: string;
  weighbridge: string;
  rollsDetail: string;
  paymentStatus: string;
  advanceAmount: string;
  balanceDueLabel: string;
  terms: string;
  deliveryInspectionTitle: string;
  autoCreditNote: string;
  acceptedQty: string;
  damagedQty: string;
  shortageQty: string;
  creditNoteNotice: string;
  adjustCreditNote: string;
  marginCalculator: string;
  grossRevenue: string;
  landedCost: string;
  freightCost: string;
  hamaliCost: string;
  cashDiscount: string;
  dalaliBrokerage: string;
  netProfit: string;
  updateMarginBtn: string;
  printInvoiceBtn: string;

  // Network
  groupBuyingTab: string;
  peerSourcingTab: string;
  tradePassportTab: string;
  samoohikKharid: string;
  samoohikKharidSub: string;
  joinPoolBtn: string;
  peerDirectory: string;
  peerDirectorySub: string;
  tradePassport: string;
  tradePassportSub: string;
  availableStock: string;
  callContact: string;

  // Ledger
  doubleEntryStatus: string;
  doubleEntrySub: string;
  totalLiquidity: string;
  physicalDrawerTitle: string;
  physicalDrawerSub: string;
  cashVarianceMatched: string;
  cashVarianceMismatch: string;
  partyLedgerTitle: string;
  recordPaymentBtn: string;

  // Modals (New Deal & Invoice)
  createDealTitle: string;
  createDealSubtitle: string;
  selectParty: string;
  itemName: string;
  lotGrade: string;
  quantity: string;
  unit: string;
  rate: string;
  paymentTermsLabel: string;
  freightTermsLabel: string;
  paid: string;
  toPay: string;
  summaryTotal: string;
  summaryAdvance: string;
  summaryBalance: string;
  summaryLanded: string;
  summaryFreight: string;
  summaryHandling: string;
  summaryMargin: string;
  createDealSubmit: string;
  cancelBtn: string;

  // Footer
  footerCopyright: string;
  footerTagline: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    // Brand & Header
    brandTitle: 'Vyapar Setu',
    brandSubtitle: 'Wholesale & B2B Trade Operating System',
    mandiLive: 'Market Live',
    firmName: 'Apex Trading & Distribution Co.',
    firmLocation: 'Pan-India Wholesale Network (Bengaluru • Mumbai • Delhi • Surat)',
    textileMode: 'Textiles & Garments',
    buildingMode: 'Building Materials & Cement',
    textileModeIndicator: 'Fabric Roll & Cut-Length Inventory Tracking',
    buildingModeIndicator: 'Bulk Weighbridge, Tonnes & Bag Inventory Tracking',
    roleLabel: 'Role:',
    roleOwner: 'Business Owner / Proprietor',
    roleMunim: 'Accountant / Finance Manager',
    roleGodown: 'Warehouse & Dispatch Manager',
    cashInHand: 'Cash in Hand (Drawer)',
    bankBalance: 'Bank Balance',
    resetDemoData: 'Reset Demo Data',
    resetConfirm: 'Do you want to reset all demo data to default?',
    resetSuccess: 'Demo data has been reset successfully!',

    // Tabs
    tabCockpit: 'Daily Cockpit',
    tabCockpitSub: 'Business Overview',
    tabControlTower: 'Order Control Tower',
    tabControlTowerSub: 'Orders & Fulfillment',
    tabNetwork: 'Trade Network',
    tabNetworkSub: 'Group Buying & Peers',
    tabLedger: 'Digital Ledger',
    tabLedgerSub: 'Double-Entry Accounting',

    // Cockpit Top Briefing
    totalReceivables: 'Total Receivables',
    totalReceivablesSub: 'Pending collection from trade buyers',
    criticalOverdue: '30+ Days Overdue',
    criticalOverdueSub: 'Urgent collection needed via WhatsApp',
    todaysPayables: "Today's Payables",
    todaysPayablesSub: 'Supplier invoices due today',
    deadStockCapital: 'Blocked Capital',
    deadStockCapitalSub: 'Idle inventory > 60 days in warehouse',

    // Radar
    receivablesRadar: 'Receivables Aging Radar',
    receivablesRadarSub: 'Send 1-Click WhatsApp payment reminders with instant UPI links',
    allBucket: 'All',
    days30Plus: '30+ Days',
    days15To30: '15-30 Days',
    days0To15: '0-15 Days',
    criticalBadge: 'Overdue!',
    lastPayment: 'Last Paid:',
    sendWhatsApp: 'Send Reminder (WhatsApp)',

    // Quick dictation & NLP
    quickDictateTitle: 'Log by Voice or Text',
    quickDictateSub: 'Pan-India Multilingual Assistant (English, Hindi, Kannada, Hinglish)',
    aiParserActive: 'AI Parser Active',
    quickSamplesLabel: 'Quick order templates (Click to populate):',
    dictatePlaceholder: "e.g. 'Sold 50 meters Chanderi Silk to Sharma Cloth Store at Rs 260, received 5000 advance, balance on 15 days credit'...",
    listeningNotice: 'Listening to your voice... (Auto-extracting trade details)',
    stopListening: 'Stop Listening',
    startSpeaking: 'Start Speaking',
    parseAndDraft: 'Parse & Review Draft',
    twoStepInvariant: '2-Step Verification Invariant',
    verifyDraft: 'Review Order Draft',
    confidence: 'Confidence:',
    party: 'Buyer / Party:',
    type: 'Type:',
    itemLot: 'Item / Specification:',
    qtyRate: 'Quantity @ Rate:',
    cashPaid: 'Advance / Received:',
    balanceDue: 'Balance Due:',
    commitToKhata: 'Commit to Ledger & Pipeline',
    cancel: 'Cancel',
    committedSuccess: 'Order committed to ledger and control tower successfully!',

    // Reminder Modal
    reminderPreview: 'WhatsApp Payment Reminder Preview',
    recipient: 'Recipient:',
    copied: 'Copied!',
    copyMessage: 'Copy Message',
    sendViaWhatsApp: 'Send via WhatsApp',

    // Dead Stock
    deadStockTitle: 'Slow-Moving Stock (>60 Days Idle)',
    deadStockSub: 'Inventory holding capital with low turnover in warehouse:',
    deadStockDays: 'days idle',
    broadcastDiscount: 'Broadcast 10% Clearance',

    // Control Tower
    stages: {
      SAUDA_CONFIRMED: '1. Order Confirmed',
      CREDIT_VERIFIED: '2. Credit & Advance Verified',
      STOCK_PICKING: '3. Warehouse Picking & Allocation',
      DISPATCHED: '4. Dispatched & Waybill Generated',
      DELIVERED_CHECK: '5. Delivery & Shortage Inspection',
      SETTLED: '6. Payment Reconciled & Closed',
    },
    filterAll: 'All Stages',
    newDealBtn: '+ New Order',
    dealNumber: 'Order No:',
    activeDealsTitle: 'Active Orders',
    dealsAvailable: 'orders active',
    advanceCTA: 'Advance to Next Stage',
    dispatchDetails: 'Consignment & Dispatch Details',
    truckNo: 'Truck / Vehicle No:',
    driver: 'Driver:',
    carrier: 'Transporter:',
    weighbridge: 'Weighbridge Slip:',
    rollsDetail: 'Roll Allocation:',
    paymentStatus: 'Payment & Terms Status',
    advanceAmount: 'Advance Received:',
    balanceDueLabel: 'Balance Due:',
    terms: 'Payment Terms:',
    deliveryInspectionTitle: 'Delivery & Shortage Inspection',
    autoCreditNote: 'Auto Credit Note Adjustment',
    acceptedQty: 'Accepted Quantity',
    damagedQty: 'Damaged Quantity',
    shortageQty: 'Shortage Quantity',
    creditNoteNotice: 'Credit Note issued for damaged/short goods:',
    adjustCreditNote: 'Adjust Credit Note in Ledger',
    marginCalculator: 'True Net Order Margin Calculator',
    grossRevenue: 'Gross Revenue',
    landedCost: 'Landed Cost (COGS)',
    freightCost: 'Freight / Transport',
    hamaliCost: 'Loading & Handling',
    cashDiscount: 'Cash Discount',
    dalaliBrokerage: 'Commission & Brokerage',
    netProfit: 'True Net Profit',
    updateMarginBtn: 'Save Margin Updates',
    printInvoiceBtn: 'Print Tax Invoice & Waybill',

    // Network
    groupBuyingTab: 'Group Sourcing Pools',
    peerSourcingTab: 'Peer Merchant Sourcing',
    tradePassportTab: 'Trade Reputation Passport',
    samoohikKharid: 'Group Sourcing Pools',
    samoohikKharidSub: 'Combine purchasing volume with fellow merchants across India for direct mill tier discounts',
    joinPoolBtn: 'Pledge Order Volume',
    peerDirectory: 'Verified B2B Peer Sourcing Directory',
    peerDirectorySub: 'Connect with verified wholesale distributors in Bengaluru, Mumbai, Delhi, Surat & Hyderabad',
    tradePassport: 'Business Credibility & Trust Passport',
    tradePassportSub: 'Verified B2B payment history & trade rating credential',
    availableStock: 'Available Inventory Preview:',
    callContact: 'Call / Contact Merchant',

    // Ledger
    doubleEntryStatus: 'Double-Entry Invariant Status',
    doubleEntrySub: 'All accounting vouchers mathematically balanced (Zero Discrepancy)',
    totalLiquidity: 'Total Working Capital',
    physicalDrawerTitle: 'Cash Drawer Physical Tally',
    physicalDrawerSub: 'Count ₹500, ₹200, ₹100 currency notes in physical drawer',
    cashVarianceMatched: 'Exact Match: Physical drawer matches digital balance',
    cashVarianceMismatch: 'Variance Alert: Discrepancy detected with ledger',
    partyLedgerTitle: 'Party Account Statement',
    recordPaymentBtn: '+ Record Payment',

    // Modals
    createDealTitle: 'Create New Order',
    createDealSubtitle: 'Wholesale Order Entry',
    selectParty: 'Select Trade Buyer',
    itemName: 'Item Name',
    lotGrade: 'Lot / Specification Grade',
    quantity: 'Quantity',
    unit: 'Unit of Measure',
    rate: 'Unit Selling Rate (₹)',
    paymentTermsLabel: 'Payment Terms',
    freightTermsLabel: 'Freight Terms',
    paid: 'Paid',
    toPay: 'To Pay',
    summaryTotal: 'Total Order Value',
    summaryAdvance: 'Advance Received',
    summaryBalance: 'Balance Due',
    summaryLanded: 'Landed COGS (est. 82%)',
    summaryFreight: 'Freight / Transport',
    summaryHandling: 'Handling & Loading',
    summaryMargin: 'Net Order Margin %',
    createDealSubmit: 'Create Wholesale Order',
    cancelBtn: 'Cancel',

    // Footer
    footerCopyright: 'Vyapar Setu © 2026 • Pan-India Wholesale & Distribution Operating System',
    footerTagline: 'Offline-First SQLite Architecture • Double-Entry Accounting Verified',
  },

  hi: {
    // Brand & Header
    brandTitle: 'व्यापार सेतु',
    brandSubtitle: 'थोक व्यापार व वितरण ऑपरेटिंग सिस्टम',
    mandiLive: 'बाजार लाइव',
    firmName: 'एपेक्स ट्रेडिंग एंड डिस्ट्रीब्यूशन',
    firmLocation: 'अखिल भारतीय थोक नेटवर्क (मुंबई • बेंगलुरु • दिल्ली • सूरत)',
    textileMode: 'कपड़ा व वस्त्र व्यापार',
    buildingMode: 'निर्माण सामग्री व सीमेंट',
    textileModeIndicator: 'थान व कट-लेंथ स्टॉक ट्रैकिंग',
    buildingModeIndicator: 'टन, बोरी व वे-ब्रिज वजन ट्रैकिंग',
    roleLabel: 'पद:',
    roleOwner: 'व्यवसाय मालिक / प्रोप्राइटर (Owner)',
    roleMunim: 'लेखापाल / वित्त प्रबंधक (Accountant)',
    roleGodown: 'गोदाम व डिस्पैच प्रभारी (Warehouse Manager)',
    cashInHand: 'नकद रोकड़ (Cash Drawer)',
    bankBalance: 'बैंक बैलेंस',
    resetDemoData: 'डेमो रीसेट',
    resetConfirm: 'क्या आप सभी डेमो डेटा को मूल स्थिति में रीसेट करना चाहते हैं?',
    resetSuccess: 'डेमो डेटा सफलतापूर्वक रीसेट हो गया!',

    // Tabs
    tabCockpit: 'दैनिक कॉकपिट',
    tabCockpitSub: 'व्यापार अवलोकन',
    tabControlTower: 'ऑर्डर कंट्रोल टॉवर',
    tabControlTowerSub: 'ऑर्डर व रवानगी',
    tabNetwork: 'व्यापार नेटवर्क',
    tabNetworkSub: 'सामूहिक खरीद व साथी',
    tabLedger: 'डिजिटल बही-खाता',
    tabLedgerSub: 'दोहरा लेखा बही',

    // Cockpit Top Briefing
    totalReceivables: 'कुल प्राप्य राशि',
    totalReceivablesSub: 'खरीदारों से वसूली अपेक्षित',
    criticalOverdue: '30+ दिन अति-देय',
    criticalOverdueSub: 'WhatsApp द्वारा तुरंत भुगतान स्मरण भेजें',
    todaysPayables: 'आज की देनदारी',
    todaysPayablesSub: 'आपूर्तिकर्ता बिल देय',
    deadStockCapital: 'अवरुद्ध पूंजी',
    deadStockCapitalSub: '60+ दिनों से गोदाम में अटका स्टॉक',

    // Radar
    receivablesRadar: 'उधारी रडार',
    receivablesRadarSub: 'तुरंत UPI भुगतान लिंक सहित 1-क्लिक WhatsApp स्मरण भेजें',
    allBucket: 'सभी',
    days30Plus: '30+ दिन',
    days15To30: '15-30 दिन',
    days0To15: '0-15 दिन',
    criticalBadge: 'अति-देय!',
    lastPayment: 'अंतिम भुगतान:',
    sendWhatsApp: 'भुगतान स्मरण (WhatsApp)',

    // Quick dictation & NLP
    quickDictateTitle: 'बोलकर या लिखकर दर्ज करें',
    quickDictateSub: 'अखिल भारतीय बहुभाषी वॉइस सहायक (अंग्रेजी, हिन्दी, कन्नड़, हिंगलिश)',
    aiParserActive: 'AI पार्सर सक्रिय',
    quickSamplesLabel: 'त्वरित ऑर्डर नमूना (क्लिक करें):',
    dictatePlaceholder: "उदा. 'शर्मा स्टोर्स को 50 मीटर सिल्क दिया 260 रुपये दर से, 5000 अग्रिम, बाकी 15 दिन की उधारी'...",
    listeningNotice: 'आपकी आवाज सुनी जा रही है... (स्वचालित रूप से विवरण दर्ज हो रहा है)',
    stopListening: 'सुनना बंद करें',
    startSpeaking: 'बोलकर दर्ज करें',
    parseAndDraft: 'पार्स करें व ड्राफ्ट जांचें',
    twoStepInvariant: '2-चरणीय सत्यापन नियम',
    verifyDraft: 'ऑर्डर ड्राफ्ट सत्यापन',
    confidence: 'विश्वसनीयता:',
    party: 'व्यापारी / पार्टी:',
    type: 'प्रकार:',
    itemLot: 'आइटम व विवरण:',
    qtyRate: 'मात्रा व दर:',
    cashPaid: 'अग्रिम / प्राप्त:',
    balanceDue: 'बकाया राशि:',
    commitToKhata: 'खाते व पाइपलाइन में दर्ज करें',
    cancel: 'रद्द करें',
    committedSuccess: 'ऑर्डर सफलतापूर्वक बही-खाते और कंट्रोल टॉवर में दर्ज हो गया!',

    // Reminder Modal
    reminderPreview: 'WhatsApp भुगतान स्मरण संदेश पूर्वावलोकन',
    recipient: 'प्राप्तकर्ता:',
    copied: 'कॉपी हो गया!',
    copyMessage: 'संदेश कॉपी करें',
    sendViaWhatsApp: 'WhatsApp पर भेजें',

    // Dead Stock
    deadStockTitle: 'धीमी गति का स्टॉक (>60 दिन रुका स्टॉक)',
    deadStockSub: 'यह माल गोदाम में फंसा है और पूंजी ब्लॉक कर रहा है:',
    deadStockDays: 'दिनों से शून्य बिक्री',
    broadcastDiscount: '10% क्लीयरेंस छूट',

    // Control Tower
    stages: {
      SAUDA_CONFIRMED: '1. ऑर्डर पुष्ट',
      CREDIT_VERIFIED: '2. साख व अग्रिम जांच',
      STOCK_PICKING: '3. गोदाम उठान व आवंटन',
      DISPATCHED: '4. रवानगी व बिल्टी',
      DELIVERED_CHECK: '5. पहुंच व माल जांच',
      SETTLED: '6. भुगतान चुकता',
    },
    filterAll: 'सभी चरण',
    newDealBtn: '+ नया ऑर्डर',
    dealNumber: 'ऑर्डर नं:',
    activeDealsTitle: 'सक्रिय ऑर्डर',
    dealsAvailable: 'ऑर्डर उपलब्ध',
    advanceCTA: 'अगले चरण में बढ़ाएं',
    dispatchDetails: 'गाड़ी रवानगी व बिल्टी विवरण',
    truckNo: 'वाहन संख्या:',
    driver: 'चालक:',
    carrier: 'ट्रांसपोर्टर:',
    weighbridge: 'वे-ब्रिज पर्ची:',
    rollsDetail: 'थान आवंटन:',
    paymentStatus: 'भुगतान व उधारी स्थिति',
    advanceAmount: 'अग्रिम जमा:',
    balanceDueLabel: 'बकाया राशि:',
    terms: 'भुगतान शर्तें:',
    deliveryInspectionTitle: 'पहुंच व नुकसान सत्यापन',
    autoCreditNote: 'क्रेडिट नोट स्वतः समायोजन',
    acceptedQty: 'स्वीकृत मात्रा',
    damagedQty: 'खराब माल',
    shortageQty: 'कमी (Shortage)',
    creditNoteNotice: 'कमी/नुकसान हेतु जारी क्रेडिट नोट:',
    adjustCreditNote: 'क्रेडिट नोट समायोजित करें',
    marginCalculator: 'सच्चा शुद्ध मुनाफा कैलकुलेटर',
    grossRevenue: 'कुल राजस्व',
    landedCost: 'लागत मूल्य',
    freightCost: 'भाड़ा व परिवहन',
    hamaliCost: 'हमाली व लोडिंग',
    cashDiscount: 'नकद छूट',
    dalaliBrokerage: 'कमीशन व ब्रोकरेज',
    netProfit: 'शुद्ध मुनाफा',
    updateMarginBtn: 'मार्जिन सुरक्षित करें',
    printInvoiceBtn: 'टैक्स इनवॉइस व बिल्टी प्रिंट करें',

    // Network
    groupBuyingTab: 'सामूहिक खरीद पूल',
    peerSourcingTab: 'साथी व्यापारी नेटवर्क',
    tradePassportTab: 'व्यापार साख पासपोर्ट',
    samoohikKharid: 'सामूहिक खरीद पूल',
    samoohikKharidSub: 'देश भर के साथी व्यापारियों के साथ मिलकर बड़ी मात्रा में सीधे मिल से छूट पाएं',
    joinPoolBtn: 'मात्रा जोड़ें (Pledge)',
    peerDirectory: 'सत्यापित B2B व्यापारी डायरेक्टरी',
    peerDirectorySub: 'बेंगलुरु, मुंबई, दिल्ली, सूरत और हैदराबाद के सत्यापित थोक व्यापारी',
    tradePassport: 'व्यापार साख व प्रतिष्ठा पासपोर्ट',
    tradePassportSub: 'सत्यापित व्यापार साख व समय पर भुगतान का प्रमाण',
    availableStock: 'उपलब्ध स्टॉक विवरण:',
    callContact: 'कॉल / संपर्क करें',

    // Ledger
    doubleEntryStatus: 'दोहरा लेखा सत्यापन',
    doubleEntrySub: 'सभी खाते गणितीय रूप से शुद्ध व संतुलित हैं (Zero Discrepancy)',
    totalLiquidity: 'कुल कार्यशील पूंजी',
    physicalDrawerTitle: 'नकद रोकड़ दराज मिलान',
    physicalDrawerSub: 'दराज में उपलब्ध ₹500, ₹200, ₹100 नोटों की गिनती',
    cashVarianceMatched: 'रोकड़ एकदम सही मिली हुई है',
    cashVarianceMismatch: 'रोकड़ दराज और खाते में अंतर है',
    partyLedgerTitle: 'पार्टी बही-खाता विवरण',
    recordPaymentBtn: '+ भुगतान दर्ज करें',

    // Modals
    createDealTitle: 'नया ऑर्डर दर्ज करें',
    createDealSubtitle: 'थोक ऑर्डर प्रविष्टि',
    selectParty: 'व्यापारी / पार्टी चुनें',
    itemName: 'वस्तु का नाम',
    lotGrade: 'लॉट / विनिर्देश ग्रेड',
    quantity: 'मात्रा',
    unit: 'इकाई (Unit)',
    rate: 'बिक्री दर (₹)',
    paymentTermsLabel: 'भुगतान की शर्तें',
    freightTermsLabel: 'भाड़ा शर्तें',
    paid: 'भुगतान किया गया (Paid)',
    toPay: 'पहुंच पर देय (To Pay)',
    summaryTotal: 'कुल ऑर्डर मूल्य',
    summaryAdvance: 'अग्रिम प्राप्त',
    summaryBalance: 'बकाया राशि',
    summaryLanded: 'अनुमानित लागत (COGS @82%)',
    summaryFreight: 'भाड़ा / परिवहन',
    summaryHandling: 'हमाली व लोडिंग',
    summaryMargin: 'नेट मुनाफा मार्जिन %',
    createDealSubmit: 'नया ऑर्डर सुरक्षित करें',
    cancelBtn: 'रद्द करें',

    // Footer
    footerCopyright: 'व्यापार सेतु (Vyapar Setu) © 2026 • अखिल भारतीय थोक व व्यापार ऑपरेटिंग सिस्टम',
    footerTagline: 'Offline SQLite Architecture • Double-Entry Accounting Verified',
  },

  kn: {
    // Brand & Header
    brandTitle: 'ವ್ಯಾಪಾರ ಸೇತು',
    brandSubtitle: 'ಸಗಟು ವ್ಯಾಪಾರ ಮತ್ತು ವಿತರಣಾ ಆಪರೇಟಿಂಗ್ ಸಿಸ್ಟಮ್',
    mandiLive: 'ಮಾರುಕಟ್ಟೆ ಲೈವ್',
    firmName: 'ಅಪೆಕ್ಸ್ ಟ್ರೇಡಿಂಗ್ & ಡಿಸ್ಟ್ರಿಬ್ಯೂಷನ್',
    firmLocation: 'ಅಖಿಲ ಭಾರತ ಸಗಟು ಜಾಲ (ಬೆಂಗಳೂರು • ಮುಂಬೈ • ದೆಹಲಿ • ಸೂರತ್)',
    textileMode: 'ಜವಳಿ ಮತ್ತು ವಸ್ತ್ರ ವ್ಯಾಪಾರ',
    buildingMode: 'ನಿರ್ಮಾಣ ಸಾಮಗ್ರಿ ಮತ್ತು ಸಿಮೆಂಟ್',
    textileModeIndicator: 'ರೋಲ್ ಮತ್ತು ಕಟ್-ಲೆಂತ್ ದಾಸ್ತಾನು ಟ್ರ್ಯಾಕಿಂಗ್',
    buildingModeIndicator: 'ವೇ-ಬ್ರಿಡ್ಜ್, ಟನ್ ಮತ್ತು ಚೀಲಗಳ ದಾಸ್ತಾನು ಟ್ರ್ಯಾಕಿಂಗ್',
    roleLabel: 'ಹುದ್ದೆ:',
    roleOwner: 'ವ್ಯವಹಾರ ಮಾಲೀಕರು (Owner / Proprietor)',
    roleMunim: 'ಲೆಕ್ಕಿಗ / ಹಣಕಾಸು ವ್ಯವಸ್ಥಾಪಕ (Accountant)',
    roleGodown: 'ಗೋದಾಮು ಮತ್ತು ರವಾನೆ ವ್ಯವಸ್ಥಾಪಕ (Warehouse Manager)',
    cashInHand: 'ನಗದು ಡ್ರಾಯರ್ (Cash in Hand)',
    bankBalance: 'ಬ್ಯಾಂಕ್ ಬ್ಯಾಲೆನ್ಸ್',
    resetDemoData: 'ಡೆಮೊ ಮರುಹೊಂದಿಸಿ',
    resetConfirm: 'ಎಲ್ಲಾ ಡೆಮೊ ಡೇಟಾವನ್ನು ಮೊದಲಿನ ಸ್ಥಿತಿಗೆ ಮರುಹೊಂದಿಸಲು ನೀವು ಬಯಸುವಿರಾ?',
    resetSuccess: 'ಡೆಮೊ ಡೇಟಾವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಮರುಹೊಂದಿಸಲಾಗಿದೆ!',

    // Tabs
    tabCockpit: 'ದೈನಂದಿನ ಕಾಕ್‌ಪಿಟ್',
    tabCockpitSub: 'ವ್ಯಾಪಾರ ಅವಲೋಕನ',
    tabControlTower: 'ಆರ್ಡರ್ ಕಂಟ್ರೋಲ್ ಟವರ್',
    tabControlTowerSub: 'ಆರ್ಡರ್‌ಗಳು ಮತ್ತು ರವಾನೆ',
    tabNetwork: 'ವ್ಯಾಪಾರ ಜಾಲ',
    tabNetworkSub: 'ಸಾಮೂಹಿಕ ಖರೀದಿ ಮತ್ತು ಸಹವರ್ತಿಗಳು',
    tabLedger: 'ಡಿಜಿಟಲ್ ಖಾತೆ-ಪುಸ್ತಕ',
    tabLedgerSub: 'ದ್ವಿಪ್ರವೇಶ ಲೆಕ್ಕಪತ್ರ',

    // Cockpit Top Briefing
    totalReceivables: 'ಒಟ್ಟು ಬರಬೇಕಾದ ಬಾಕಿ',
    totalReceivablesSub: 'ಖರೀದಿದಾರರಿಂದ ಬರಬೇಕಾದ ಬಾಕಿ',
    criticalOverdue: '30+ ದಿನ ಮೀರಿದ ಬಾಕಿ',
    criticalOverdueSub: 'WhatsApp ಮೂಲಕ ಪಾವತಿ ನೆನಪೋಲೆ ಕಳುಹಿಸಿ',
    todaysPayables: 'ಇಂದಿನ ಪಾವತಿಗಳು',
    todaysPayablesSub: 'ಪೂರೈಕೆದಾರರ ಬಿಲ್ ಪಾವತಿಸಬೇಕು',
    deadStockCapital: 'ಸ್ಥಗಿತ ಬಂಡವಾಳ',
    deadStockCapitalSub: '60+ ದಿನಗಳಿಂದ ಗೋದಾಮಿನಲ್ಲಿರುವ ಸ್ಟಾಕ್',

    // Radar
    receivablesRadar: 'ಬಾಕಿ ವಸೂಲಾತಿ ರೇಡಾರ್',
    receivablesRadarSub: 'ತ್ವರಿತ UPI ಪಾವತಿ ಲಿಂಕ್‌ನೊಂದಿಗೆ 1-ಕ್ಲಿಕ್ WhatsApp ಜ್ಞಾಪನೆ ಕಳುಹಿಸಿ',
    allBucket: 'ಎಲ್ಲವೂ',
    days30Plus: '30+ ದಿನಗಳು',
    days15To30: '15-30 ದಿನಗಳು',
    days0To15: '0-15 ದಿನಗಳು',
    criticalBadge: 'ಅವಧಿ ಮೀರಿದೆ!',
    lastPayment: 'ಕೊನೆಯ ಪಾವತಿ:',
    sendWhatsApp: 'ಪಾವತಿ ಜ್ಞಾಪನೆ (WhatsApp)',

    // Quick dictation & NLP
    quickDictateTitle: 'ಧ್ವನಿ ಅಥವಾ ಟೈಪಿಂಗ್ ಮೂಲಕ ದಾಖಲಿಸಿ',
    quickDictateSub: 'ಅಖಿಲ ಭಾರತ ಬಹುಭಾಷಾ ಧ್ವನಿ ಸಹಾಯಕ (ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ, ಹಿಂಗ್ಲಿಷ್)',
    aiParserActive: 'AI ಪಾರ್ಸರ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    quickSamplesLabel: 'ತ್ವರಿತ ಆರ್ಡರ್ ಮಾದರಿಗಳು (ಕ್ಲಿಕ್ ಮಾಡಿ):',
    dictatePlaceholder: "ಉದಾ. 'ಶರ್ಮಾ ಸ್ಟೋರ್ಸ್‌ಗೆ 50 ಮೀಟರ್ ರೇಷ್ಮೆ 260 ರೂ ದರದಲ್ಲಿ ಮಾರಾಟ, 5000 ಮುಂಗಡ, ಉಳಿದದ್ದು 15 ದಿನಗಳ ಸಾಲ'...",
    listeningNotice: 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ... (ಸ್ವಯಂಚಾಲಿತವಾಗಿ ವಿವರ ಭರ್ತಿ ಮಾಡಲಾಗುತ್ತಿದೆ)',
    stopListening: 'ನಿಲ್ಲಿಸಿ',
    startSpeaking: 'ಮಾತನಾಡಿ',
    parseAndDraft: 'ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಡ್ರಾಫ್ಟ್ ರಚಿಸಿ',
    twoStepInvariant: '2-ಹಂತದ ಪರಿಶೀಲನೆ ನಿಯಮ',
    verifyDraft: 'ಆರ್ಡರ್ ಡ್ರಾಫ್ಟ್ ಪರಿಶೀಲನೆ',
    confidence: 'ವಿಶ್ವಾಸಾರ್ಹತೆ:',
    party: 'ಖರೀದಿದಾರರು / ಪಾರ್ಟಿ:',
    type: 'ವಿಧ:',
    itemLot: 'ವಸ್ತು ಮತ್ತು ವಿವರಣೆ:',
    qtyRate: 'ಪ್ರಮಾಣ ಮತ್ತು ದರ:',
    cashPaid: 'ಮುಂಗಡ / ಪಡೆದ ನಗದು:',
    balanceDue: 'ಉಳಿದ ಸಾಲ:',
    commitToKhata: 'ಖಾತೆಗೆ ದಾಖಲಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    committedSuccess: 'ಆರ್ಡರ್ ಅನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಖಾತೆ-ಪುಸ್ತಕಕ್ಕೆ ದಾಖಲಿಸಲಾಗಿದೆ!',

    // Reminder Modal
    reminderPreview: 'WhatsApp ಪಾವತಿ ಜ್ಞಾಪನೆ ಸಂದೇಶ ಪೂರ್ವವೀಕ್ಷಣೆ',
    recipient: 'ಸ್ವೀಕರಿಸುವವರು:',
    copied: 'ಕಾಪಿ ಮಾಡಲಾಗಿದೆ!',
    copyMessage: 'ಸಂದೇಶ ಕಾಪಿ ಮಾಡಿ',
    sendViaWhatsApp: 'WhatsApp ಮೂಲಕ ಕಳುಹಿಸಿ',

    // Dead Stock
    deadStockTitle: 'ಮಾರಾಟವಾಗದ ಸ್ಟಾಕ್ (>60 ದಿನಗಳು)',
    deadStockSub: 'ಗೋದಾಮಿನಲ್ಲಿ ಸಿಲುಕಿರುವ ಮತ್ತು ಬಂಡವಾಳ ತಡೆಹಿಡಿದಿರುವ ಸಾಮಗ್ರಿ:',
    deadStockDays: 'ದಿನಗಳಿಂದ ಶೂನ್ಯ ಮಾರಾಟ',
    broadcastDiscount: '10% ಕ್ಲಿಯರೆನ್ಸ್ ರಿಯಾಯಿತಿ',

    // Control Tower
    stages: {
      SAUDA_CONFIRMED: '1. ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
      CREDIT_VERIFIED: '2. ಸಾಲ ಮತ್ತು ಮುಂಗಡ ಪರಿಶೀಲನೆ',
      STOCK_PICKING: '3. ಸ್ಟಾಕ್ ಆಯ್ಕೆ ಮತ್ತು ಹಂಚಿಕೆ',
      DISPATCHED: '4. ಸರಕು ರವಾನೆ ಮತ್ತು ಬಿಲ್ಟಿ',
      DELIVERED_CHECK: '5. ತಲುಪಿದ ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ',
      SETTLED: '6. ಪಾವತಿ ಇತ್ಯರ್ಥ',
    },
    filterAll: 'ಎಲ್ಲಾ ಹಂತಗಳು',
    newDealBtn: '+ ಹೊಸ ಆರ್ಡರ್',
    dealNumber: 'ಆರ್ಡರ್ ಸಂ:',
    activeDealsTitle: 'ಸಕ್ರಿಯ ಆರ್ಡರ್‌ಗಳು',
    dealsAvailable: 'ಆರ್ಡರ್‌ಗಳು ಲಭ್ಯವಿವೆ',
    advanceCTA: 'ಮುಂದಿನ ಹಂತಕ್ಕೆ ಮುನ್ನಡೆಯಿರಿ',
    dispatchDetails: 'ರವಾನೆ ಮತ್ತು ಬಿಲ್ಟಿ ವಿವರಗಳು',
    truckNo: 'ವಾಹನ ಸಂಖ್ಯೆ:',
    driver: 'ಚಾಲಕ:',
    carrier: 'ಟ್ರಾನ್ಸ್‌ಪೋರ್ಟರ್:',
    weighbridge: 'ವೇ-ಬ್ರಿಡ್ಜ್ ಸ್ಲಿಪ್:',
    rollsDetail: 'ರೋಲ್ ಹಂಚಿಕೆ:',
    paymentStatus: 'ಪಾವತಿ ಮತ್ತು ಸಾಲದ ಸ್ಥಿತಿ',
    advanceAmount: 'ಪಡೆದ ಮುಂಗಡ:',
    balanceDueLabel: 'ಉಳಿದ ಸಾಲ:',
    terms: 'ಪಾವತಿ ನಿಯಮಗಳು:',
    deliveryInspectionTitle: 'ರವಾನೆ ಮತ್ತು ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ',
    autoCreditNote: 'ಸ್ವಯಂ ಕ್ರೆಡಿಟ್ ನೋಟ್ ಹೊಂದಾಣಿಕೆ',
    acceptedQty: 'ಸ್ವೀಕರಿಸಿದ ಪ್ರಮಾಣ',
    damagedQty: 'ಹಾನಿಗೊಳಗಾದ ಪ್ರಮಾಣ',
    shortageQty: 'ಕೊರತೆ ಪ್ರಮಾಣ',
    creditNoteNotice: 'ಹಾನಿಗೊಳಗಾದ ಸರಕಿಗೆ ನೀಡಲಾದ ಕ್ರೆಡಿಟ್ ನೋಟ್:',
    adjustCreditNote: 'ಖಾತೆಯಲ್ಲಿ ಹೊಂದಿಸಿ',
    marginCalculator: 'ನಿವ್ವಳ ಲಾಭ ಕ್ಯಾಲ್ಕುಲೇಟರ್',
    grossRevenue: 'ಒಟ್ಟು ಮಾರಾಟ',
    landedCost: 'ಖರೀದಿ ವೆಚ್ಚ',
    freightCost: 'ಸಾರಿಗೆ ವೆಚ್ಚ',
    hamaliCost: 'ಹಮಾಲಿ ಮತ್ತು ಲೋಡಿಂಗ್',
    cashDiscount: 'ನಗದು ರಿಯಾಯಿತಿ',
    dalaliBrokerage: 'ಕಮಿಷನ್ / ಬ್ರೋಕರೇಜ್',
    netProfit: 'ನಿವ್ವಳ ಲಾಭ',
    updateMarginBtn: 'ಮಾರ್ಜಿನ್ ಉಳಿಸಿ',
    printInvoiceBtn: 'ಟ್ಯಾಕ್ಸ್ ಇನ್‌ವಾಯ್ಸ್ & ಬಿಲ್ಟಿ ಪ್ರಿಂಟ್',

    // Network
    groupBuyingTab: 'ಸಾಮೂಹಿಕ ಖರೀದಿ ಪೂಲ್‌ಗಳು',
    peerSourcingTab: 'ಸಹವರ್ತಿ ವ್ಯಾಪಾರಿಗಳ ನೆಟ್‌ವರ್ಕ್',
    tradePassportTab: 'ವ್ಯಾಪಾರ ವಿಶ್ವಾಸಾರ್ಹತೆ ಪಾಸ್‌ಪೋರ್ಟ್',
    samoohikKharid: 'ಸಾಮೂಹಿಕ ಖರೀದಿ ಪೂಲ್‌ಗಳು',
    samoohikKharidSub: 'ದೇಶಾದ್ಯಂತದ ಇತರ ವ್ಯಾಪಾರಿಗಳೊಂದಿಗೆ ಸೇರಿ ನೇರವಾಗಿ ಉತ್ಪಾದಕರಿಂದ ರಿಯಾಯಿತಿ ಪಡೆಯಿರಿ',
    joinPoolBtn: 'ಪ್ರಮಾಣ ಸೇರಿಸಿ (Pledge)',
    peerDirectory: 'ಪರಿಶೀಲಿಸಿದ B2B ಸಗಟು ಡೈರೆಕ್ಟರಿ',
    peerDirectorySub: 'ಬೆಂಗಳೂರು, ಮುಂಬೈ, ದೆಹಲಿ, ಸೂರತ್ ಮತ್ತು ಹೈದರಾಬಾದ್‌ನ ಪರಿಶೀಲಿಸಿದ ಸಗಟು ವ್ಯಾಪಾರಿಗಳು',
    tradePassport: 'ವ್ಯವಹಾರ ವಿಶ್ವಾಸಾರ್ಹತೆ ಪಾಸ್‌ಪೋರ್ಟ್',
    tradePassportSub: 'ದೃಢೀಕೃತ ವಹಿವಾಟು ಕ್ರೆಡಿಟ್ ಮತ್ತು ಸಕಾಲಿಕ ಪಾವತಿ ದಾಖಲೆ',
    availableStock: 'ಲಭ್ಯವಿರುವ ದಾಸ್ತಾನು ವಿವರ:',
    callContact: 'ಸಂಪರ್ಕಿಸಿ / ಕರೆ ಮಾಡಿ',

    // Ledger
    doubleEntryStatus: 'ದ್ವಿಪ್ರವೇಶ ಲೆಕ್ಕಪತ್ರ ಪರಿಶೀಲನೆ',
    doubleEntrySub: 'ಎಲ್ಲಾ ವೋಚರ್‌ಗಳು ಸಮತೋಲನದಲ್ಲಿವೆ (Zero Discrepancy)',
    totalLiquidity: 'ಒಟ್ಟು ಕಾರ್ಯನಿರತ ಬಂಡವಾಳ',
    physicalDrawerTitle: 'ನಗದು ಡ್ರಾಯರ್ ತಾಳೆ',
    physicalDrawerSub: 'ಡ್ರಾಯರ್‌ನಲ್ಲಿರುವ ₹500, ₹200, ₹100 ನೋಟುಗಳ ಎಣಿಕೆ',
    cashVarianceMatched: 'ನಗದು ನಿಖರವಾಗಿ ತಾಳೆಯಾಗಿದೆ',
    cashVarianceMismatch: 'ನಗದು ಡ್ರಾಯರ್ ಮತ್ತು ಖಾತೆಯಲ್ಲಿ ವ್ಯತ್ಯಾಸವಿದೆ',
    partyLedgerTitle: 'ಪಾರ್ಟಿ ಖಾತೆ-ಪುಸ್ತಕ ವಿವರ',
    recordPaymentBtn: '+ ಪಾವತಿ ದಾಖಲಿಸಿ',

    // Modals
    createDealTitle: 'ಹೊಸ ಆರ್ಡರ್ ರಚಿಸಿ',
    createDealSubtitle: 'ಸಗಟು ಆರ್ಡರ್ ನಮೂದು',
    selectParty: 'ಖರೀದಿದಾರರನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    itemName: 'ವಸ್ತುವಿನ ಹೆಸರು',
    lotGrade: 'ಲಾಟ್ / ಗ್ರೇಡ್ ವಿವರ',
    quantity: 'ಪ್ರಮಾಣ',
    unit: 'ಪ್ರಮಾಣದ ಘಟಕ',
    rate: 'ಮಾರಾಟ ದರ (₹)',
    paymentTermsLabel: 'ಪಾವತಿ ನಿಯಮಗಳು',
    freightTermsLabel: 'ಸಾರಿಗೆ ಬಾಡಿಗೆ ನಿಯಮ',
    paid: 'ಪಾವತಿಸಲಾಗಿದೆ (Paid)',
    toPay: 'ತಲುಪಿದ ನಂತರ ಪಾವತಿ (To Pay)',
    summaryTotal: 'ಒಟ್ಟು ಆರ್ಡರ್ ಮೌಲ್ಯ',
    summaryAdvance: 'ಪಡೆದ ಮುಂಗಡ',
    summaryBalance: 'ಉಳಿದ ಸಾಲ',
    summaryLanded: 'ಖರೀದಿ ವೆಚ್ಚ (@82%)',
    summaryFreight: 'ಸಾರಿಗೆ ವೆಚ್ಚ',
    summaryHandling: 'ಹಮಾಲಿ ವೆಚ್ಚ',
    summaryMargin: 'ನಿವ್ವಳ ಲಾಭ %',
    createDealSubmit: 'ಆರ್ಡರ್ ದೃಢೀಕರಿಸಿ',
    cancelBtn: 'ರದ್ದುಮಾಡಿ',

    // Footer
    footerCopyright: 'ವ್ಯಾಪಾರ ಸೇತು (Vyapar Setu) © 2026 • ಅಖಿಲ ಭಾರತ ಸಗಟು ಮತ್ತು ವಿತರಣಾ ಆಪರೇಟಿಂಗ್ ಸಿಸ್ಟಮ್',
    footerTagline: 'ಆಫ್‌ಲೈನ್ SQLite ವಾಸ್ತುಶಿಲ್ಪ • ದ್ವಿಪ್ರವೇಶ ಲೆಕ್ಕಪತ್ರ ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
  },
};
