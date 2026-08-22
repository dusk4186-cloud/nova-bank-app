import { 
  Zap, CreditCard, Flame, Droplets, Landmark, GraduationCap, 
  Car, Train, Wifi, Phone, HeartPulse, Building2 
} from 'lucide-react';

export type BBPSCategory = 
  | 'electricity'
  | 'creditcard'
  | 'gas'
  | 'water'
  | 'loan'
  | 'education'
  | 'fastag'
  | 'travel'
  | 'broadband'
  | 'mobile'
  | 'insurance'
  | 'propertytax';

export type BBPSProvider = {
  id: string;
  name: string;
  shortName: string;
  region: string;
  popular?: boolean;
};

// 1. Dynamic Due Date Utility
export const getDynamicDueDate = (daysAhead: number) => {
  const target = new Date();
  target.setDate(target.getDate() + daysAhead);

  const formattedDate = target.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  if (daysAhead === 0) return `Due Today • ${formattedDate}`;
  if (daysAhead === 1) return `Due Tomorrow • ${formattedDate}`;
  if (daysAhead < 7) return `Due in ${daysAhead} days • ${formattedDate}`;
  if (daysAhead === 7) return `Due in 1 week • ${formattedDate}`;
  return `Due in ${daysAhead} days • ${formattedDate}`;
};

// 2. Dynamic Category Mock Schema
export const SERVICE_METRICS_CONFIG: Record<string, { dueInDays: number; badgeText?: string }> = {
  electricity: {
    dueInDays: 2, // Urgent
    badgeText: 'Due Soon',
  },
  loan_emi: {
    dueInDays: 5, // Upcoming
    badgeText: 'Upcoming',
  },
  broadband: {
    dueInDays: 7, // 1 Week
    badgeText: 'Upcoming',
  },
  water: {
    dueInDays: 14, // 2 Weeks
    badgeText: 'Standard',
  },
  gas: {
    dueInDays: 10,
    badgeText: 'Standard',
  },
};

export type BBPSCategoryConfig = {
  category: BBPSCategory;
  title: string;
  icon: any;
  themeColor: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  inputMode: 'numeric' | 'text';
  helperTip: string;
  providers: BBPSProvider[];
  mockBillGenerator: (identifier: string, provider: BBPSProvider, userName?: string) => {
    consumerName: string;
    billNumber: string;
    billDate: string;
    dueDate: string;
    urgencyText: string;
    amount: number;
    metrics: { label: string; value: string }[];
  };
};

export const BBPS_CONFIG: Record<BBPSCategory, BBPSCategoryConfig> = {
  electricity: {
    category: 'electricity',
    title: 'Electricity Bill',
    icon: Zap,
    themeColor: 'text-yellow-500',
    identifierLabel: 'Consumer Number / CA Number',
    identifierPlaceholder: 'e.g. 1002948291',
    inputMode: 'numeric',
    helperTip: 'You can find your 10-digit Consumer Account (CA) number at the top-right corner of your physical or digital electricity bill.',
    providers: [
      { id: 'bescom', name: 'BESCOM (Bengaluru Electricity)', shortName: 'BESCOM', region: 'Karnataka', popular: true },
      { id: 'tata-power', name: 'Tata Power - Mumbai & Delhi', shortName: 'Tata Power', region: 'National', popular: true },
      { id: 'adani-elec', name: 'Adani Electricity Mumbai', shortName: 'Adani Elec', region: 'Maharashtra', popular: true },
      { id: 'mseb', name: 'MSEDCL (Mahavitaran)', shortName: 'MSEB', region: 'Maharashtra', popular: true },
      { id: 'pspcl', name: 'PSPCL Punjab Electricity', shortName: 'PSPCL', region: 'Punjab' },
      { id: 'torrent', name: 'Torrent Power - Ahmedabad & Surat', shortName: 'Torrent', region: 'Gujarat' },
    ],
    mockBillGenerator: (id, provider, userName) => ({
      consumerName: userName || 'Alex Doe',
      billNumber: `EB-${id.slice(-6) || '849201'}`,
      billDate: '01 Aug 2026',
      dueDate: 'Due in 2 days • 20 Aug 2026',
      urgencyText: 'Due Soon',
      amount: 1450,
      metrics: [
        { label: 'Units Consumed', value: '240 kWh' },
        { label: 'Meter Number', value: 'MTR-84920' },
        { label: 'Tariff Plan', value: 'LT-1 Domestic' },
      ]
    })
  },

  creditcard: {
    category: 'creditcard',
    title: 'Credit Card Bill',
    icon: CreditCard,
    themeColor: 'text-[#5e30e1] dark:text-indigo-400',
    identifierLabel: 'Last 4 Digits of Card',
    identifierPlaceholder: 'e.g. 8821',
    inputMode: 'numeric',
    helperTip: 'Enter the last 4 digits printed on the front of your primary or add-on credit card.',
    providers: [
      { id: 'hdfc-cc', name: 'HDFC Bank Credit Cards', shortName: 'HDFC Card', region: 'National', popular: true },
      { id: 'icici-cc', name: 'ICICI Bank Credit Cards', shortName: 'ICICI Card', region: 'National', popular: true },
      { id: 'sbi-cc', name: 'SBI Card (State Bank of India)', shortName: 'SBI Card', region: 'National', popular: true },
      { id: 'axis-cc', name: 'Axis Bank Credit Cards', shortName: 'Axis Card', region: 'National', popular: true },
      { id: 'amex-cc', name: 'American Express India', shortName: 'Amex', region: 'National' },
    ],
    mockBillGenerator: (id, provider, userName) => ({
      consumerName: userName || 'Alex Doe',
      billNumber: `CC-STMT-${id || '8821'}`,
      billDate: '05 Aug 2026',
      dueDate: 'Due in 12 days • 30 Aug 2026',
      urgencyText: 'Statement Generated',
      amount: 18450,
      metrics: [
        { label: 'Card Ending', value: `**** ${id || '8821'}` },
        { label: 'Min Amount Due', value: '₹1,200' },
        { label: 'Total Credit Limit', value: '₹3,00,000' },
      ]
    })
  },

  gas: {
    category: 'gas',
    title: 'Piped Gas Bill',
    icon: Flame,
    themeColor: 'text-orange-500',
    identifierLabel: 'BP Number / Customer ID',
    identifierPlaceholder: 'e.g. 90028192',
    inputMode: 'numeric',
    helperTip: 'Your Business Partner (BP) number is an 8 to 10-digit code located on your monthly gas invoice.',
    providers: [
      { id: 'igl', name: 'Indraprastha Gas Limited (IGL)', shortName: 'IGL', region: 'Delhi NCR', popular: true },
      { id: 'mgl', name: 'Mahanagar Gas Limited (MGL)', shortName: 'MGL', region: 'Mumbai', popular: true },
      { id: 'adani-gas', name: 'Adani Total Gas', shortName: 'Adani Gas', region: 'National', popular: true },
      { id: 'gujarat-gas', name: 'Gujarat Gas Limited', shortName: 'Gujarat Gas', region: 'Gujarat' },
    ],
    mockBillGenerator: (id, provider, userName) => ({
      consumerName: userName || 'Alex Doe',
      billNumber: `GAS-${id || '900281'}`,
      billDate: '02 Aug 2026',
      dueDate: 'Due in 8 days • 26 Aug 2026',
      urgencyText: 'Regular',
      amount: 780,
      metrics: [
        { label: 'Gas Consumed', value: '18.4 SCM' },
        { label: 'BP Number', value: id || '90028192' },
        { label: 'Meter Reading', value: '1,420.5' },
      ]
    })
  },

  water: {
    category: 'water',
    title: 'Water Supply Bill',
    icon: Droplets,
    themeColor: 'text-cyan-500',
    identifierLabel: 'Consumer / RR Number',
    identifierPlaceholder: 'e.g. WTR-082491',
    inputMode: 'text',
    helperTip: 'Your Revenue Register (RR) or Connection ID is stamped on the municipal water meter receipt.',
    providers: [
      { id: 'bwssb', name: 'BWSSB Bangalore Water Supply', shortName: 'BWSSB', region: 'Karnataka', popular: true },
      { id: 'djb', name: 'Delhi Jal Board (DJB)', shortName: 'DJB', region: 'Delhi', popular: true },
      { id: 'mcgm-water', name: 'MCGM Water Mumbai', shortName: 'MCGM', region: 'Maharashtra', popular: true },
      { id: 'hmwssb', name: 'HMWSSB Hyderabad Water Board', shortName: 'HMWSSB', region: 'Telangana' },
    ],
    mockBillGenerator: (id, provider, userName) => ({
      consumerName: userName || 'Alex Doe',
      billNumber: `WTR-${id || '082491'}`,
      billDate: '01 Aug 2026',
      dueDate: 'Due in 10 days • 28 Aug 2026',
      urgencyText: 'Regular',
      amount: 420,
      metrics: [
        { label: 'Connection Type', value: 'Domestic Non-Commercial' },
        { label: 'Sanctioned Load', value: '1/2 inch pipe' },
        { label: 'Billing Cycle', value: 'Jul 2026 - Aug 2026' },
      ]
    })
  },

  loan: {
    category: 'loan',
    title: 'Loan EMI Payment',
    icon: Landmark,
    themeColor: 'text-red-500',
    identifierLabel: 'Loan Account Number',
    identifierPlaceholder: 'e.g. LN-9842104',
    inputMode: 'text',
    helperTip: 'You can find your alphanumeric Loan Account Number in your welcome letter or sanction document.',
    providers: [
      { id: 'hdfc-loan', name: 'HDFC Bank Personal & Home Loans', shortName: 'HDFC Loan', region: 'National', popular: true },
      { id: 'bajaj-fin', name: 'Bajaj Finserv Lending', shortName: 'Bajaj Finance', region: 'National', popular: true },
      { id: 'tata-cap', name: 'Tata Capital Financial Services', shortName: 'Tata Capital', region: 'National', popular: true },
      { id: 'sbi-loan', name: 'State Bank of India (Home/Car)', shortName: 'SBI Loan', region: 'National', popular: true },
      { id: 'lt-fin', name: 'L&T Finance Holdings', shortName: 'L&T Finance', region: 'National' },
    ],
    mockBillGenerator: (id, provider, userName) => ({
      consumerName: userName || 'Alex Doe',
      billNumber: `EMI-${id || 'LN-9842104'}`,
      billDate: '01 Aug 2026',
      dueDate: 'Due in 5 days • 23 Aug 2026',
      urgencyText: 'EMI Scheduled',
      amount: 12500,
      metrics: [
        { label: 'Loan Type', value: 'Personal Loan' },
        { label: 'Installment No.', value: '14 of 36' },
        { label: 'Principal + Interest', value: '₹10,200 + ₹2,300' },
      ]
    })
  },

  education: {
    category: 'education',
    title: 'Education Fees',
    icon: GraduationCap,
    themeColor: 'text-purple-500',
    identifierLabel: 'Student Enrollment / Roll ID',
    identifierPlaceholder: 'e.g. STU-2026-894',
    inputMode: 'text',
    helperTip: 'Enter the student admission number or registration ID issued on the school/college ID card.',
    providers: [
      { id: 'dps', name: 'Delhi Public School Society', shortName: 'DPS', region: 'National', popular: true },
      { id: 'ryan', name: 'Ryan International Group of Schools', shortName: 'Ryan Group', region: 'National', popular: true },
      { id: 'amity', name: 'Amity University Online & Campus', shortName: 'Amity Univ', region: 'National', popular: true },
      { id: 'narayana', name: 'Narayana Educational Institutions', shortName: 'Narayana', region: 'South India' },
    ],
    mockBillGenerator: (id, provider, userName) => ({
      consumerName: userName || 'Alex Doe',
      billNumber: `FEE-${id || 'STU-894'}`,
      billDate: '01 Aug 2026',
      dueDate: 'Due in 14 days • 01 Sep 2026',
      urgencyText: 'Term Fee',
      amount: 24000,
      metrics: [
        { label: 'Term / Quarter', value: 'Q2 (Jul - Sep 2026)' },
        { label: 'Student Grade', value: 'Standard IX - Section B' },
        { label: 'Tuition + Lab', value: '₹20,000 + ₹4,000' },
      ]
    })
  },

  fastag: {
    category: 'fastag',
    title: 'FASTag Recharge',
    icon: Car,
    themeColor: 'text-emerald-500',
    identifierLabel: 'Vehicle Registration Number',
    identifierPlaceholder: 'e.g. MH 02 AB 1234 or KA 01 MJ 4920',
    inputMode: 'text',
    helperTip: 'Enter your vehicle registration plate number without spaces or special characters.',
    providers: [
      { id: 'icici-fastag', name: 'ICICI Bank FASTag', shortName: 'ICICI FASTag', region: 'National', popular: true },
      { id: 'nhai-fastag', name: 'NHAI / IHMCL National FASTag', shortName: 'NHAI FASTag', region: 'National', popular: true },
      { id: 'hdfc-fastag', name: 'HDFC Bank FASTag', shortName: 'HDFC FASTag', region: 'National', popular: true },
      { id: 'paytm-fastag', name: 'Paytm Payments Bank FASTag', shortName: 'Paytm FASTag', region: 'National', popular: true },
      { id: 'sbi-fastag', name: 'State Bank of India FASTag', shortName: 'SBI FASTag', region: 'National' },
      { id: 'kotak-fastag', name: 'Kotak Mahindra Bank FASTag', shortName: 'Kotak FASTag', region: 'National' },
    ],
    mockBillGenerator: (id, provider, userName) => ({
      consumerName: userName || 'Alex Doe',
      billNumber: `TAG-${id.replace(/\s/g, '') || 'KA01MJ4920'}`,
      billDate: '18 Aug 2026',
      dueDate: 'Instant Recharge',
      urgencyText: 'Low Tag Balance',
      amount: 1000,
      metrics: [
        { label: 'Vehicle Number', value: (id || 'KA 01 MJ 4920').toUpperCase() },
        { label: 'Current Balance', value: '₹140.50' },
        { label: 'Tag Status', value: 'Active • Class 4 (Car/Jeep)' },
      ]
    })
  },

  travel: {
    category: 'travel',
    title: 'Metro & Transit Card',
    icon: Train,
    themeColor: 'text-blue-500',
    identifierLabel: 'Smart Card Engraved ID',
    identifierPlaceholder: 'e.g. NMMC-849201',
    inputMode: 'text',
    helperTip: 'Enter the 8 to 11 digit card number engraved on the reverse side of your transit smart card.',
    providers: [
      { id: 'namma-metro', name: 'Namma Metro Bengaluru (BMRCL)', shortName: 'Namma Metro', region: 'Karnataka', popular: true },
      { id: 'delhi-metro', name: 'Delhi Metro Rail Corp (DMRC)', shortName: 'Delhi Metro', region: 'Delhi NCR', popular: true },
      { id: 'mumbai-metro', name: 'Mumbai Metro (Maha Mumbai Metro)', shortName: 'Mumbai Metro', region: 'Maharashtra', popular: true },
      { id: 'chennai-metro', name: 'Chennai Metro Rail (CMRL)', shortName: 'Chennai Metro', region: 'Tamil Nadu' },
    ],
    mockBillGenerator: (id, provider, userName) => ({
      consumerName: userName || 'Alex Doe',
      billNumber: `METRO-${id || '849201'}`,
      billDate: '18 Aug 2026',
      dueDate: 'Instant Top-up',
      urgencyText: 'Transit Pass',
      amount: 500,
      metrics: [
        { label: 'Card Engraved ID', value: id || 'NMMC-849201' },
        { label: 'Live Card Balance', value: '₹42.00' },
        { label: 'Card Expiry', value: '31 Dec 2030' },
      ]
    })
  },

  broadband: {
    category: 'broadband',
    title: 'Broadband / Landline',
    icon: Wifi,
    themeColor: 'text-sky-500',
    identifierLabel: 'Account ID / Telephone Number',
    identifierPlaceholder: 'e.g. 0804123982',
    inputMode: 'numeric',
    helperTip: 'Enter your Broadband Subscriber Account ID or Landline STD code + number without leading zeroes.',
    providers: [
      { id: 'airtel-fiber', name: 'Airtel Xstream Fiber', shortName: 'Airtel Fiber', region: 'National', popular: true },
      { id: 'jio-fiber', name: 'JioFiber Broadband', shortName: 'JioFiber', region: 'National', popular: true },
      { id: 'act-fiber', name: 'ACT Fibernet Broadband', shortName: 'ACT Fiber', region: 'South & West', popular: true },
      { id: 'tata-play', name: 'Tata Play Fiber', shortName: 'Tata Play', region: 'National' },
      { id: 'bsnl-ftth', name: 'BSNL Bharat Fiber (FTTH)', shortName: 'BSNL FTTH', region: 'National' },
    ],
    mockBillGenerator: (id, provider, userName) => ({
      consumerName: userName || 'Alex Doe',
      billNumber: `BB-${id || '0804123982'}`,
      billDate: '04 Aug 2026',
      dueDate: 'Due in 7 days • 25 Aug 2026',
      urgencyText: 'Monthly Bill',
      amount: 899,
      metrics: [
        { label: 'Fiber Speed', value: '300 Mbps Unlimited' },
        { label: 'Circuit ID', value: 'BLR-FIB-8921' },
        { label: 'Included Benefits', value: 'Disney+ Hotstar, Xstream Premium' },
      ]
    })
  },

  mobile: {
    category: 'mobile',
    title: 'Mobile Postpaid',
    icon: Phone,
    themeColor: 'text-green-500',
    identifierLabel: '10-Digit Mobile Number',
    identifierPlaceholder: 'e.g. 9876543210',
    inputMode: 'numeric',
    helperTip: 'Enter your active 10-digit mobile number for postpaid bill payment.',
    providers: [
      { id: 'jio-postpaid', name: 'Jio Postpaid Plus', shortName: 'Jio Postpaid', region: 'National', popular: true },
      { id: 'airtel-postpaid', name: 'Airtel Postpaid Infinity', shortName: 'Airtel Postpaid', region: 'National', popular: true },
      { id: 'vi-postpaid', name: 'Vodafone Idea (Vi) Postpaid', shortName: 'Vi Postpaid', region: 'National', popular: true },
      { id: 'bsnl-mobile', name: 'BSNL Mobile Postpaid', shortName: 'BSNL Mobile', region: 'National' },
    ],
    mockBillGenerator: (id, provider, userName) => ({
      consumerName: userName || 'Alex Doe',
      billNumber: `MOB-${id || '9876543210'}`,
      billDate: '03 Aug 2026',
      dueDate: 'Due in 4 days • 22 Aug 2026',
      urgencyText: 'Postpaid Due',
      amount: 599,
      metrics: [
        { label: 'Plan Name', value: 'Postpaid 75GB Rollover' },
        { label: 'Telecom Circle', value: 'Karnataka Circle' },
        { label: 'Data Remaining', value: '42.8 GB' },
      ]
    })
  },

  insurance: {
    category: 'insurance',
    title: 'Insurance Premium',
    icon: HeartPulse,
    themeColor: 'text-pink-500',
    identifierLabel: 'Policy Number',
    identifierPlaceholder: 'e.g. POL-9482103',
    inputMode: 'text',
    helperTip: 'Enter your complete policy number without spaces as mentioned on your policy schedule document.',
    providers: [
      { id: 'lic', name: 'Life Insurance Corporation of India (LIC)', shortName: 'LIC India', region: 'National', popular: true },
      { id: 'hdfc-life', name: 'HDFC Life Insurance', shortName: 'HDFC Life', region: 'National', popular: true },
      { id: 'icici-pru', name: 'ICICI Prudential Life Insurance', shortName: 'ICICI Pru', region: 'National', popular: true },
      { id: 'max-life', name: 'Max Life Insurance', shortName: 'Max Life', region: 'National', popular: true },
      { id: 'sbi-life', name: 'SBI Life Insurance Company', shortName: 'SBI Life', region: 'National' },
    ],
    mockBillGenerator: (id, provider, userName) => ({
      consumerName: userName || 'Alex Doe',
      billNumber: `POL-${id || '9482103'}`,
      billDate: '01 Aug 2026',
      dueDate: 'Due in 15 days • 02 Sep 2026',
      urgencyText: 'Annual Premium',
      amount: 4800,
      metrics: [
        { label: 'Plan Category', value: 'Term Life Comprehensive Shield' },
        { label: 'Sum Assured', value: '₹1,00,00,000 (1 Crore)' },
        { label: 'Premium Frequency', value: 'Annual' },
      ]
    })
  },

  propertytax: {
    category: 'propertytax',
    title: 'Municipal Property Tax',
    icon: Building2,
    themeColor: 'text-amber-500',
    identifierLabel: 'Property SAS / Assessment ID',
    identifierPlaceholder: 'e.g. SAS-0824-912',
    inputMode: 'text',
    helperTip: 'Enter your 10-digit Property Identification Number (PID) or Self Assessment Scheme (SAS) ID.',
    providers: [
      { id: 'bbmp', name: 'BBMP Bruhat Bengaluru Mahanagara Palike', shortName: 'BBMP', region: 'Bengaluru', popular: true },
      { id: 'mcd', name: 'Municipal Corporation of Delhi (MCD)', shortName: 'MCD', region: 'Delhi', popular: true },
      { id: 'bmc', name: 'BMC Brihanmumbai Municipal Corp', shortName: 'BMC Mumbai', region: 'Mumbai', popular: true },
      { id: 'ghmc', name: 'GHMC Greater Hyderabad Municipal Corp', shortName: 'GHMC', region: 'Hyderabad' },
    ],
    mockBillGenerator: (id, provider, userName) => ({
      consumerName: userName || 'Alex Doe',
      billNumber: `TAX-${id || 'SAS-912'}`,
      billDate: '01 Apr 2026',
      dueDate: 'Due in 20 days • 07 Sep 2026',
      urgencyText: 'Property Tax',
      amount: 3200,
      metrics: [
        { label: 'Assessment Year', value: '2026 - 2027' },
        { label: 'Property Zone', value: 'Zone 4 - Indiranagar' },
        { label: 'Rebate Applied', value: '5% Early Payment Rebate' },
      ]
    })
  },
};
