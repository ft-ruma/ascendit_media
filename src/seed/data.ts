// Built-in seed content. The site renders from this when DATABASE_URI is not set,
// and `pnpm seed` copies it into Payload. Client names, quotes and prices are
// placeholders until Ascendit supplies the real ones (Sprint 5 gate).
import type {
  Career, CaseStudy, LegalPage, Pillar, Pricing, Product, RateCardEntry, Settings, TeamMember, Testimonial,
} from '@/lib/types'

export const settings: Settings = {
  stats: { clients: 60, team: 7, products: 3, years: 6 },
  whatsapp: '+94743662318',
  bookingUrl: 'https://cal.com/ascendit/discovery',
  email: 'sales@ascendit.dev',
  phone: '+94 74 366 2318',
  office: {
    line1: 'Main Street',
    city: 'Nittambuwa',
    country: 'Sri Lanka',
    mapUrl: 'https://maps.google.com/?q=Nittambuwa,Sri+Lanka',
  },
  socials: [
    { label: 'Instagram', url: 'https://www.instagram.com/ascenditmedia' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/company/ascendit-media' },
  ],
  openForProjects: true,
  founderNote: {
    quote:
      'We started Ascendit because shop owners kept asking for one team that could design the store, build the till and ship the website. That is still the whole idea: one studio, one system, from the floor plan to the first sale.',
    name: 'The founder',
    role: 'Creative Director, Ascendit Media',
  },
}

export const pillars: Pillar[] = [
  {
    key: 'retail',
    slug: 'retail-design',
    name: 'Retail design',
    accent: 'tangerine',
    oneLiner: 'Store interiors that sell, drawn, rendered and built with you.',
    h1: 'Retail store design and shop interior design in Sri Lanka',
    intro:
      'From a 200 sq ft kiosk to a 6,000 sq ft flagship, we plan the floor, design the fixtures, render every corner before a single board is cut, and stay on site until the doors open.',
    capabilities: [
      'Floor planning and customer flow',
      'Fixture, shelving and counter design',
      'Photoreal 3D renders and walkthroughs',
      'Signage, lighting and material schedules',
      'Contractor drawings and BOQ',
      'Site supervision to handover',
    ],
    process: [
      { title: 'Site visit', body: 'We measure, photograph and learn how your customers move today.' },
      { title: 'Concept', body: 'Two layout options and a mood board, priced so you can choose with numbers.' },
      { title: 'Render', body: 'Photoreal stills and a walkthrough so you see the store before it exists.' },
      { title: 'Drawings', body: 'Shop drawings, BOQ and material schedules your contractor can quote from.' },
      { title: 'Supervision', body: 'Weekly site checks until handover, so the build matches the render.' },
    ],
    tools: ['SketchUp', 'Enscape', 'AutoCAD', 'Blender', 'Figma'],
    fromPriceLKR: 250000,
    fromPriceUSD: 1250,
  },
  {
    key: 'software',
    slug: 'software',
    name: 'Software',
    accent: 'lilac',
    oneLiner: 'Custom systems for the way your business actually runs.',
    h1: 'POS, CRM and custom software development in Sri Lanka',
    intro:
      'When an off-the-shelf app bends your process out of shape, we build the system around it: inventory, billing, staff, reports and the integrations that tie them together.',
    capabilities: [
      'Business process mapping',
      'Web apps and dashboards',
      'Mobile apps for staff and customers',
      'Inventory, billing and HR modules',
      'Payment gateway and accounting integrations',
      'Hosting, support and SLAs',
    ],
    process: [
      { title: 'Discovery', body: 'Workshops with the people who will use it, not just the people paying for it.' },
      { title: 'Prototype', body: 'A clickable prototype in two weeks so the team can try before we build.' },
      { title: 'Build', body: 'Two-week sprints with a demo at the end of each one.' },
      { title: 'Launch', body: 'Data migration, staff training and a calm go-live.' },
      { title: 'Support', body: 'Monitoring, fixes and new features on a monthly plan.' },
    ],
    tools: ['TypeScript', 'Next.js', 'React Native', 'Postgres', 'Supabase', 'Azure'],
    fromPriceLKR: 450000,
    fromPriceUSD: 2500,
  },
  {
    key: 'web',
    slug: 'web',
    name: 'Web',
    accent: 'aqua',
    oneLiner: 'Fast websites and online stores that bring in work.',
    h1: 'Web design and development in Sri Lanka',
    intro:
      'Marketing sites, online stores and landing pages built to load fast on a mid-range phone, rank for what your customers search, and turn visits into enquiries.',
    capabilities: [
      'Marketing websites',
      'Online stores with local payment gateways',
      'Landing pages for ads',
      'CMS so your team can edit',
      'SEO, analytics and conversion tracking',
      'Care plans and hosting',
    ],
    process: [
      { title: 'Brief', body: 'Goals, audience, pages and the one action every page should drive.' },
      { title: 'Design', body: 'Mobile first, in your brand, reviewed in the browser.' },
      { title: 'Build', body: 'Fast, accessible, editable, and tested on real devices.' },
      { title: 'Launch', body: 'Redirects, analytics and Search Console set up on day one.' },
    ],
    tools: ['Next.js', 'Payload', 'Shopify', 'WooCommerce', 'Vercel'],
    fromPriceLKR: 180000,
    fromPriceUSD: 900,
  },
  {
    key: 'brand',
    slug: 'brand',
    name: 'Brand & content',
    accent: 'lime',
    oneLiner: 'Identities and launch content people remember.',
    h1: 'Branding, logo design and content production in Sri Lanka',
    intro:
      'Names, logos, packaging and the photo, video and social content that launches a store or a product, made by the same team that designed the space.',
    capabilities: [
      'Naming and brand strategy',
      'Logo and identity systems',
      'Packaging and print',
      'Photo and video production',
      'Social content calendars',
      'Launch campaigns',
    ],
    process: [
      { title: 'Listen', body: 'Who you are, who you sell to, and who you are up against.' },
      { title: 'Explore', body: 'Three directions, each with a reason behind it.' },
      { title: 'Refine', body: 'One direction, built out into a system you can use everywhere.' },
      { title: 'Produce', body: 'Shoots, edits and a month of content ready to post.' },
    ],
    tools: ['Illustrator', 'Figma', 'After Effects', 'Premiere', 'Lightroom'],
    fromPriceLKR: 150000,
    fromPriceUSD: 750,
  },
]

export const testimonials: Testimonial[] = [
  {
    quote: 'They designed the shop, set up the POS and shot our launch reels. We opened on time and the till worked on day one.',
    person: 'Store owner',
    role: 'Owner',
    company: 'Sample Grocer, Gampaha',
    caseStudy: 'sample-grocer-flagship',
  },
  {
    quote: 'The renders were so close to the finished store that customers asked if we had used photos.',
    person: 'Operations lead',
    role: 'Operations',
    company: 'Sample Pharmacy Chain',
    caseStudy: 'sample-pharmacy-refit',
  },
  {
    quote: 'Our online orders doubled in the first quarter after the new site went live.',
    person: 'Co-founder',
    role: 'Co-founder',
    company: 'Sample Tea Co., UK',
    caseStudy: 'sample-tea-online-store',
  },
]

export const caseStudies: CaseStudy[] = [
  {
    slug: 'sample-grocer-flagship',
    client: 'Sample Grocer',
    industry: 'Grocery',
    location: 'LK',
    pillars: ['retail', 'software', 'brand'],
    result: 'Opened in 9 weeks with design, POS and launch content from one team.',
    brief:
      'A family grocer moving from a 600 sq ft corner shop to a 2,400 sq ft flagship wanted a modern store without losing the neighbourhood feel, and a till system the existing staff could learn in a day.',
    approach: [
      { pillar: 'retail', body: 'A loop layout that pulls shoppers past fresh produce first, with low gondolas so the whole floor is visible from the counter.' },
      { pillar: 'software', body: 'Ascendit POS with barcode scanning, supplier credit tracking and a daily WhatsApp sales summary for the owner.' },
      { pillar: 'brand', body: 'Refreshed signage, shelf talkers and a two-week launch campaign on Instagram and Facebook.' },
    ],
    metrics: [
      { label: 'Design to opening', value: '9', unit: 'weeks' },
      { label: 'Average basket', value: '+34', unit: '%' },
      { label: 'Floor area', value: '2,400', unit: 'sq ft' },
    ],
    gallery: [],
    quote: testimonials[0],
    windowFileName: 'grocer-flagship.case',
    featured: true,
    publishedAt: '2026-06-01',
  },
  {
    slug: 'sample-pharmacy-refit',
    client: 'Sample Pharmacy Chain',
    industry: 'Healthcare retail',
    location: 'LK',
    pillars: ['retail'],
    result: 'One fixture system rolled out across 5 branches.',
    brief: 'A growing pharmacy chain needed a store design that could be built in any shell, from a 300 sq ft roadside unit to a mall corner.',
    approach: [
      { pillar: 'retail', body: 'A modular fixture kit with three counter sizes, a standard dispensary layout and a lighting schedule contractors could price in a day.' },
    ],
    metrics: [
      { label: 'Branches fitted', value: '5' },
      { label: 'Fit-out time per branch', value: '-40', unit: '%' },
    ],
    gallery: [],
    quote: testimonials[1],
    windowFileName: 'pharmacy-refit.case',
    featured: true,
    publishedAt: '2026-04-12',
  },
  {
    slug: 'sample-tea-online-store',
    client: 'Sample Tea Co.',
    industry: 'Food & beverage',
    location: 'intl',
    pillars: ['web', 'brand'],
    result: 'Online orders doubled in the first quarter.',
    brief: 'A UK importer of single-estate Ceylon tea wanted an online store that told the story of each estate and shipped across Europe.',
    approach: [
      { pillar: 'web', body: 'A fast headless store with estate pages, subscriptions and EU shipping rules.' },
      { pillar: 'brand', body: 'Packaging refresh and a product shoot in the hill country.' },
    ],
    metrics: [
      { label: 'Online orders', value: '2x' },
      { label: 'Mobile LCP', value: '1.6', unit: 's' },
    ],
    gallery: [],
    quote: testimonials[2],
    windowFileName: 'tea-store.case',
    featured: true,
    publishedAt: '2026-02-20',
  },
  {
    slug: 'sample-clinic-system',
    client: 'Sample Clinic Group',
    industry: 'Healthcare',
    location: 'LK',
    pillars: ['software'],
    result: 'Appointments, records and billing in one place for 3 clinics.',
    brief: 'Three clinics running on paper books and spreadsheets wanted one system for appointments, patient records and billing.',
    approach: [
      { pillar: 'software', body: 'CareSuite configured for multi-branch scheduling, SMS reminders and a doctor dashboard.' },
    ],
    metrics: [
      { label: 'No-shows', value: '-28', unit: '%' },
      { label: 'Clinics live', value: '3' },
    ],
    gallery: [],
    windowFileName: 'clinic-system.case',
    featured: false,
    publishedAt: '2025-11-03',
  },
]

export const products: Product[] = [
  {
    slug: 'pos',
    name: 'Ascendit POS',
    glyph: 'POS',
    accent: 'tangerine',
    pitch: 'A point of sale built for Sri Lankan shops: fast billing, stock that counts itself, and sales on your phone.',
    audience: 'Grocers, pharmacies, boutiques, hardware and any shop with a counter.',
    features: [
      { title: 'Fast billing', body: 'Barcode, quick keys and split payments, with thermal receipt printing.' },
      { title: 'Stock that counts itself', body: 'Every sale updates stock; low-stock alerts before you run out.' },
      { title: 'Supplier credit', body: 'Track what you owe and what you are owed, by supplier and customer.' },
      { title: 'Multi-branch', body: 'One dashboard for every branch, with transfers between them.' },
      { title: 'Daily WhatsApp summary', body: 'Sales, cash and top items sent to the owner every night.' },
    ],
    plans: [
      { name: 'Starter', LKR: 4900, USD: 19, yearlyDiscountPct: 15, setupLKR: 15000, setupUSD: 60 },
      { name: 'Growth', LKR: 9900, USD: 39, yearlyDiscountPct: 15, setupLKR: 25000, setupUSD: 100, highlight: true },
      { name: 'Multi-branch', LKR: 19900, USD: 79, yearlyDiscountPct: 15, setupLKR: 45000, setupUSD: 180 },
    ],
    demoUrl: null,
    trialUrl: null,
    faq: [
      { q: 'Does it work offline?', a: 'Yes. Billing keeps working without internet and syncs when the connection is back.' },
      { q: 'Which printers and scanners work?', a: 'Standard 80 mm thermal printers and USB or Bluetooth barcode scanners.' },
      { q: 'Can you move my existing stock list?', a: 'Yes, setup includes importing your items from Excel or your old system.' },
    ],
  },
  {
    slug: 'crm',
    name: 'Ascendit CRM',
    glyph: 'CRM',
    accent: 'aqua',
    pitch: 'Leads, clients and projects in one place, with WhatsApp built in.',
    audience: 'Agencies, service businesses, sales teams and studios.',
    features: [
      { title: 'Pipeline', body: 'Every lead from web, WhatsApp and walk-ins on one board.' },
      { title: 'WhatsApp inbox', body: 'Reply to customers from the CRM and keep the history with the client.' },
      { title: 'Quotes and invoices', body: 'In LKR or USD, sent as PDF or link.' },
      { title: 'Projects', body: 'Tasks, files and hours against every client.' },
      { title: 'Reports', body: 'Win rate, revenue and response time by person and source.' },
    ],
    plans: [
      { name: 'Team', LKR: 6900, USD: 29, yearlyDiscountPct: 15, setupLKR: 20000, setupUSD: 80 },
      { name: 'Business', LKR: 14900, USD: 59, yearlyDiscountPct: 15, setupLKR: 35000, setupUSD: 140, highlight: true },
    ],
    demoUrl: null,
    trialUrl: null,
    faq: [
      { q: 'Is my data stored in Sri Lanka?', a: 'Data is stored on managed cloud infrastructure with daily backups; ask us about regional options.' },
      { q: 'How many users are included?', a: 'Team includes 5 users and Business includes 20. Extra seats are billed monthly.' },
    ],
  },
  {
    slug: 'caresuite',
    name: 'CareSuite',
    glyph: 'Care',
    accent: 'lilac',
    pitch: 'Appointments, patient records and billing for clinics and care providers.',
    audience: 'Clinics, channelling centres, physiotherapy and care providers.',
    features: [
      { title: 'Appointments', body: 'Online booking, doctor schedules and SMS reminders.' },
      { title: 'Patient records', body: 'Visit notes, prescriptions and files, searchable in seconds.' },
      { title: 'Billing', body: 'Consultation, procedure and pharmacy billing in one invoice.' },
      { title: 'Multi-branch', body: 'Share records across branches with role-based access.' },
      { title: 'Reports', body: 'Daily takings, doctor utilisation and no-show rates.' },
    ],
    plans: [
      { name: 'Clinic', LKR: 9900, USD: 39, yearlyDiscountPct: 15, setupLKR: 30000, setupUSD: 120 },
      { name: 'Group', LKR: 24900, USD: 99, yearlyDiscountPct: 15, setupLKR: 60000, setupUSD: 240, highlight: true },
    ],
    demoUrl: null,
    trialUrl: null,
    faq: [
      { q: 'Who can see patient records?', a: 'Only roles you allow. Every view and edit is logged.' },
      { q: 'Can patients book online?', a: 'Yes, through a booking page you can link from your website or WhatsApp.' },
    ],
  },
]

export const rateCard: RateCardEntry[] = [
  {
    pillar: 'retail',
    unit: 'sqft',
    basePriceLKR: 120,
    basePriceUSD: 0.6,
    multipliers: [
      { question: 'service', answer: 'design-supervision', factor: 1.35 },
      { question: 'renders', answer: 'walkthrough', factor: 1.15 },
    ],
  },
  {
    pillar: 'software',
    unit: 'project',
    basePriceLKR: 450000,
    basePriceUSD: 2500,
    multipliers: [
      { question: 'modules', answer: '3-5', factor: 1.8 },
      { question: 'modules', answer: '6+', factor: 3 },
      { question: 'platform', answer: 'web-mobile', factor: 1.5 },
    ],
  },
  {
    pillar: 'web',
    unit: 'project',
    basePriceLKR: 180000,
    basePriceUSD: 900,
    multipliers: [
      { question: 'pages', answer: '6-15', factor: 1.5 },
      { question: 'pages', answer: '16-40', factor: 2.4 },
      { question: 'type', answer: 'store', factor: 1.6 },
      { question: 'storeSize', answer: '50-500', factor: 1.2 },
      { question: 'storeSize', answer: '500+', factor: 1.5 },
    ],
  },
  {
    pillar: 'brand',
    unit: 'project',
    basePriceLKR: 150000,
    basePriceUSD: 750,
    multipliers: [
      { question: 'deliverable', answer: 'identity-content', factor: 1.7 },
      { question: 'channels', answer: '3-4', factor: 1.2 },
      { question: 'channels', answer: '5+', factor: 1.4 },
      { question: 'volume', answer: 'up-to-12', factor: 1.2 },
      { question: 'volume', answer: '13-30', factor: 1.5 },
      { question: 'volume', answer: '30+', factor: 2 },
    ],
  },
]

export const pricing: Pricing = { bundleSavingPct: 0.1, rangeWidth: 1.6, roundLKR: 5000, roundUSD: 50 }

export const team: TeamMember[] = [
  { name: 'Founder', role: 'Founder & Creative Director', order: 1 },
  { name: 'Lead designer', role: 'Retail & interior design', order: 2 },
  { name: '3D artist', role: 'Renders & walkthroughs', order: 3 },
  { name: 'Engineering lead', role: 'Software & products', order: 4 },
  { name: 'Full-stack developer', role: 'Web & integrations', order: 5 },
  { name: 'Front-end developer', role: 'Web & apps', order: 6 },
  { name: 'Content producer', role: 'Photo, video & social', order: 7 },
]

export const careers: Career[] = [
  {
    slug: 'junior-3d-visualiser',
    title: 'Junior 3D visualiser',
    type: 'Full-time',
    location: 'Nittambuwa, on site',
    summary: 'Turn floor plans into renders clients fall for.',
    description: [
      'You will model and render retail interiors in SketchUp and Enscape, working with our lead designer from the first site visit to the final walkthrough.',
      'You have a portfolio of interiors or architecture renders, care about light and materials, and want to learn how stores are actually built.',
    ],
    open: true,
  },
  {
    slug: 'front-end-developer',
    title: 'Front-end developer',
    type: 'Full-time',
    location: 'Nittambuwa or remote in Sri Lanka',
    summary: 'Build fast, playful interfaces in React and Next.js.',
    description: [
      'You will build client websites, product dashboards and this very site, working in TypeScript, React and Next.js.',
      'You sweat performance and accessibility, and you like motion that has a reason to exist.',
    ],
    open: true,
  },
]

export const legalPages: LegalPage[] = [
  {
    slug: 'privacy',
    title: 'Privacy policy',
    updated: '2026-10-09',
    body: [
      'This policy explains what Ascendit Media collects when you use ascendit.dev and what we do with it.',
      'Briefs and contact forms: when you send a brief, request a demo or apply for a job, we store your answers, contact details and estimate in our CRM so we can reply and follow up. If you leave the project builder after entering a valid email or WhatsApp number, we save your partial answers so we can help you finish.',
      'Analytics: we use privacy-friendly analytics to count visits and builder drop-off by step. We do not sell your data.',
      'Advertising conversions: if you arrived from an ad, we record the campaign parameters and send a conversion event to the ad platform (Meta, Google) when you submit a brief, so we know which ads work.',
      'Storage: your sound and currency choices and your builder progress are stored in your browser. Lead data is stored with our CRM provider and kept for as long as needed to serve you, or until you ask us to delete it.',
      'Your rights: email sales@ascendit.dev to see, correct or delete the data we hold about you.',
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of use',
    updated: '2026-10-09',
    body: [
      'By using ascendit.dev you agree to these terms.',
      'Estimates: the price ranges shown by the project builder are indicative only and are not a quotation. A written quotation follows a discovery call.',
      'Content: the designs, renders, photos and text on this site belong to Ascendit Media or our clients and may not be reused without permission.',
      'Products: use of Ascendit POS, Ascendit CRM and CareSuite is governed by the subscription agreement you sign when you subscribe.',
      'These terms are governed by the laws of Sri Lanka.',
    ],
  },
]
