export const LANDING_COPY = {
  nav: {
    logo: "CommonGround",
    links: ["Features", "Pricing", "Sign Up"],
    cta: "Get Started",
  },
  hero: {
    eyebrow: "The $20B HOA management industry doesn't want you to read this.",
    headline: "Power Your Neighborhood.",
    subheadline: "They profit from keeping you in the dark. CommonGround brings the light — and keeps your money where it belongs: in YOUR neighborhood.",
    cta: "🏠 Dismantle the old system. Power your neighborhood. →",
    ctaSecondary: "Show Me the Receipts ↓",
    trustBar: "✦ 5 Mount Juliet neighborhoods are already proving the old model is dying",
    stats: [
      { value: "AI-Verified", label: "Ledger" },
      { value: "90%+", label: "Savings" },
      { value: "Vote", label: "Any Phone" },
      { value: "Lake", label: "Lifestyle" },
    ],
  },
  problem: {
    headline: "Where did your HOA dues actually go last month?",
    subheadline: "Your management company charges you 40% overhead for sending emails. We think that's theft.",
    painPoints: [
      {
        icon: "❌",
        title: "$28/door/month",
        desc: "40% goes to corporate overhead. That's not management. That's a tax on your community.",
        sub: "Nashville corporate overhead",
      },
      {
        icon: "❌",
        title: "PDF Once a Quarter",
        desc: 'No real-time visibility. They charge you a premium to see your own money. By design.',
        sub: "No real-time visibility",
      },
      {
        icon: "❌",
        title: "Vote Once a Year",
        desc: "Your voice limited to an annual meeting. The system is rigged to minimize your input.",
        sub: "Annual in-person meetings",
      },
    ],
    cta: "The $20B HOA management industry is built on your silence. It's time to speak up. →",
  },
  howItWorks: {
    headline: "Running your neighborhood shouldn't require a management company.",
    steps: [
      {
        number: "1",
        title: "Switch",
        icon: "🏠",
        desc: "Your board flips the switch. $2/door/month. Flat fee. No hidden costs.",
      },
      {
        number: "2",
        title: "See",
        icon: "👁️",
        desc: "Every dollar tracked in real-time. AI-verified. The Glass House™ ledger.",
      },
      {
        number: "3",
        title: "Decide",
        icon: "📱",
        desc: "Vote on budgets, bylaws, and vendors from your phone. Your neighborhood, your say.",
      },
    ],
  },
  costComparison: {
    headline: "The math is simple. Your neighborhood deserves better.",
    traditional: {
      title: "❌ Corporate Management",
      price: "$28",
      perUnit: "per door/month",
      details: [
        "💼 40% corporate overhead",
        "📄 Quarterly PDF reports",
        "🗳️ Annual meetings only",
        "🔧 Middleman maintenance",
      ],
      total: "$13,200/year",
      totalLabel: "(50-unit neighborhood)",
    },
    commonground: {
      title: "✅ You-Powered",
      price: "$2",
      perUnit: "per door/month",
      details: [
        "🏡 100% stays local",
        "📱 Real-time ledger",
        "🗳️ Vote from phone",
        "🤖 AI-triage → vendor",
      ],
      total: "$1,200/year",
      totalLabel: "(50-unit neighborhood)",
    },
    savingsBanner: "Mount Juliet Neighborhoods Save 90%+  🎉",
    neighborhoodSavings: [
      { name: "Willoughby Station (800)", savings: "$244,800/yr" },
      { name: "Providence (1,000+)", savings: "$306,000/yr" },
      { name: "Jackson Hills (300)", savings: "$72,000/yr" },
      { name: "Kelsey Glen (150)", savings: "$36,000/yr" },
    ],
    cta: "Calculate Your Neighborhood's Savings →",
  },
  features: {
    headline: "Everything you need. Nothing you don't.",
    cards: [
      {
        icon: "🗳️",
        title: "Resident-Owned Governance",
        description: "Universal voting engine. Proposals. Bylaws. All from your phone.",
        subline: '"Your management firm votes once a year. You vote every day."',
        accent: "brand-primary",
      },
      {
        icon: "📊",
        title: "The Glass House™",
        description: "Real-time, AI-verified ledger. Click any expense to see the audit trail.",
        subline: '"Your old management firm calls quarterly PDFs transparency. We call that the bare minimum."',
        accent: "brand-secondary",
      },
      {
        icon: "🔧",
        title: "AI-Powered Triage",
        description: "Report an issue. AI categorizes and routes it to a vendor. No middleman.",
        subline: '"Your management firm charges 40% overhead to forward emails. Our AI does it in seconds. For free."',
        accent: "brand-accent",
      },
      {
        icon: "🤝",
        title: "Social Agency",
        description: "Interest circles. Social clubs. Event voting. Donation votes.",
        subline: '"Your neighborhood isn\'t a portfolio. It\'s your home."',
        accent: "brand-energy",
      },
    ],
    cta: "See All Features →",
  },
  testimonials: {
    headline: "Neighbors like you are making the switch.",
    quotes: [
      {
        text: "We were paying $28/door/month and getting quarterly PDFs. Now we see every dollar in real-time. Our board actually enjoys managing the HOA.",
        author: "Sarah T.",
        role: "Board Member, Willoughby Station",
      },
      {
        text: "The AI triage is a game-changer. We had a leak on Sunday and a plumber was assigned by Monday morning.",
        author: "Mike R.",
        role: "Resident, Providence",
      },
    ],
  },
  mountJuliet: {
    headline: "Built for Mount Juliet. Not for a Nashville boardroom.",
    tagline: "The City Between the Lakes deserves management that keeps up with the lifestyle.",
    features: [
      {
        icon: "🌊",
        title: "Lake Lifestyle, Not Corporate Overhead",
        desc: "Your HOA fees should fund lake weekends and community events, not a management CEO's bonus. CommonGround keeps 100% of your dues in Mount Juliet.",
      },
      {
        icon: "⚡",
        title: "Storm-Ready, Not Corporate-Slow",
        desc: 'Tree down after a storm? Our AI routes it to a vendor in minutes — not after your management firm\'s 48-hour "processing window."',
      },
      {
        icon: "🤖",
        title: "TN Compliance, Not Corporate Scare Tactics",
        desc: "Your old management firm uses compliance as a reason you need them. Our AI Auditor automates it. For free. The Tennessee Nonprofit Act isn't scary — it's your right to transparency.",
      },
    ],
  },
  signup: {
    headline: "Is YOUR neighborhood next?",
    subheadline: "Mount Juliet is leading the way. Join the first 5 neighborhoods to take back control.",
    fields: {
      neighborhood: "Neighborhood Name",
      name: "Your Name",
      email: "Email",
      phone: "Phone",
      role: "Your Role",
      units: "# of Units",
      currentMgmt: "Current Mgmt",
    },
    cta: "🏠 Apply for Pilot →",
    disclaimer: "We'll reach out within 48 hours to walk your board through the switch.",
    phone: "Or call us: (615) 555-COMMONGROUND",
    success: "Application received! We'll be in touch within 48 hours.",
  },
  footer: {
    tagline: "Your neighborhood, your say.",
    copyright: "© 2025 CommonGround. All rights reserved.",
    location: "Mount Juliet, TN",
    columns: [
      {
        title: "Product",
        links: ["Features", "Pricing", "Pilot"],
      },
      {
        title: "Company",
        links: ["About", "Blog", "Contact"],
      },
      {
        title: "Legal",
        links: ["Privacy", "Terms", "TN Comply"],
      },
      {
        title: "Connect",
        links: ["Twitter", "LinkedIn", "Nextdoor"],
      },
    ],
  },
};
