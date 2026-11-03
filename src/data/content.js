export const profile = {
  name: "Elghodhben Iyed",
  title: "Full-Stack Developer",
  location: "Ariana, Tunisia",
  email: "iyed.elghodhben@gmail.com",
  linkedin: "https://linkedin.com/in/elghodhben-iyed",
  resume: "/Elghodhben-Iyed-CV.pdf",
  positioning: "B2B SaaS engineer who makes financial compliance boring — in a good way.",
};

export const bio = {
  quote:
    "I build the financial backbone of B2B SaaS products — multi-tenant Laravel and Vue.js systems that turn regulatory complexity into software you can trust. Over the past three years I've shipped invoicing and accounting engines, HR & payroll platforms, and geofenced mobile apps now running in production across Tunisia. I'm most useful on the problems other developers avoid: exact calculation logic, tenant isolation, and the edge cases where a rounding error becomes a compliance incident.",
  strengths: [
    {
      title: "Regulatory-grade engineering",
      detail:
        "Built Tunisia's TTN / El Fatoora e-invoicing integration and encoded national tax and labor law directly into core calculation logic, where correctness isn't optional.",
    },
    {
      title: "Full-stack, full lifecycle",
      detail:
        "Ships backend (Laravel, Node.js), frontend (Vue.js, Angular), and native mobile (Ionic/Capacitor, including raw Android debugging) without handoffs.",
    },
    {
      title: "Multi-tenant SaaS architecture",
      detail:
        "Designs and hardens tenant isolation on live platforms serving multiple B2B clients from one codebase.",
    },
    {
      title: "API-first discipline",
      detail:
        "Documents every service with Swagger/REST contracts; has shipped JWT auth, API gateways, and microservice-to-microservice messaging in production.",
    },
    {
      title: "Four companies, three years, rising stakes",
      detail:
        "Moved from a public transit ticketing platform to national financial-compliance systems, each step handed more complex domain logic.",
    },
  ],
};

export const projects = [
  {
    slug: "iberis-finances",
    name: "Iberis Finances",
    tagline: "Multi-tenant financial SaaS that speaks fluent Tunisian tax law.",
    role: "Iberis",
    dates: "Dec 2025 – Present",
    problem:
      "Tunisian businesses need to issue legally compliant invoices, quotations, and ledger entries while meeting a new national e-invoicing mandate — across many isolated client organizations sharing one platform.",
    stack: ["Laravel", "Vue.js", "MySQL", "Redis", "Swagger"],
    highlights: [
      "Owns calculation logic guaranteeing exact amount consistency across invoicing, quotations, payments, inventory, and ledger entries",
      "Built the integration to Tunisia's national e-invoicing system (TTN / El Fatoora) plus multiple local payment gateways",
      "Encoded Tunisian accounting and tax-compliance rules directly into document and payment workflows",
      "Designed a modular Laravel architecture documented end-to-end with Swagger",
    ],
    visual: "ledger",
    links: [{ label: "Live platform", url: "https://finances.iberis.io/" }],
  },
  {
    slug: "iberis-rh",
    name: "Iberis RH & Geo-Attendance",
    tagline: "Payroll, permissions, and a phone that knows when you've actually walked into the office.",
    role: "Iberis",
    dates: "Dec 2025 – Present",
    problem:
      "Clients needed an HR platform — leave, org hierarchy, roles — plus Tunisian-compliant payroll, and a mobile app that verifies attendance by location without being easily spoofed or draining battery.",
    stack: ["Laravel", "Vue.js", "Ionic", "Capacitor", "Android", "PHPUnit"],
    highlights: [
      "Built the HR module: leave management, organizational hierarchy, granular roles and permissions",
      "Implemented payroll processing compliant with Tunisian labor legislation",
      "Shipped a geofenced time-and-attendance app; personally debugged native Android location services, permissions, and background sync",
      "Hardened multi-tenant isolation and added automated PHPUnit coverage",
    ],
    visual: "geofence",
    links: [{ label: "Live platform", url: "https://hr.iberis.io/" }],
  },
  {
    slug: "netadvisor",
    name: "NetAdvisor",
    tagline: "A microservices backend connecting personal shoppers and clients, live.",
    role: "NetAdvisor",
    dates: "Sep 2024 – Jul 2025",
    problem:
      "A social-commerce platform needed real-time chat between personal shoppers and clients, secure service-to-service communication, and a public Angular site — under a compressed timeline.",
    stack: ["Laravel 12", "Node.js", "Socket.IO", "Angular 16", "JWT", "API Gateway"],
    highlights: [
      "Designed the Laravel 12 backend with real-time messaging via Node.js and Socket.IO",
      "Built a microservices SaaS backend with an API Gateway for secure inter-service communication",
      "Implemented JWT auth/authz — middleware permissions on the backend, guards/interceptors on Angular",
      "Delivered the Kastelo Tunisia site end-to-end: Laravel APIs + Angular 16 UI, clean architecture, unit tests",
    ],
    visual: "network",
    links: [
      { label: "Kastelo", url: "https://www.kastelo.com.tn/" },
      { label: "Topomer · Google Play", url: "https://play.google.com/store/apps/details?id=com.topomer.application" },
    ],
  },
  {
    slug: "stb-bus",
    name: "STB Bus Subscriptions",
    tagline: "Taking a national transit operator's ticketing online.",
    role: "AMA Business Tunisie",
    dates: "May 2024 – Sep 2024",
    problem:
      "STB, Tunisia's national bus operator, needed riders to buy subscriptions online with secure payment, plus staff tooling to manage the program — alongside a portfolio of legacy sites to keep alive.",
    stack: ["Laravel 11", "MySQL", "ClickToPay", "CodeIgniter 3"],
    highlights: [
      "Built the public purchase flow and a full admin management dashboard from scratch",
      "Integrated ClickToPay for secure online payment",
      "Maintained and modernized legacy CodeIgniter 3 and WordPress platforms in parallel",
    ],
    visual: "ticket",
  },
];

export const skills = [
  {
    category: "Domain Expertise",
    flagship: true,
    note: "The scarce skill most candidates don't have.",
    items: [
      "Financial & accounting workflows",
      "Tunisian tax compliance",
      "Payroll & labor law",
      "E-invoicing (TTN / El Fatoora)",
      "Multi-tenant security",
    ],
  },
  {
    category: "Core Stack",
    items: ["Laravel", "PHP", "Vue.js", "Node.js"],
  },
  {
    category: "Frontend & Mobile",
    items: ["Vue.js", "Angular", "Ionic", "Capacitor", "Native Android"],
  },
  {
    category: "Architecture",
    items: ["Multi-tenant SaaS", "Microservices", "API Gateway", "Clean Architecture (MVC+Services)"],
  },
  {
    category: "Data & Messaging",
    items: ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Socket.IO", "Webhooks"],
  },
  {
    category: "APIs & Auth",
    items: ["RESTful APIs", "Swagger / OpenAPI", "JWT"],
  },
  {
    category: "DevOps & Quality",
    items: ["Git", "GitLab CI/CD", "Docker", "Plesk", "PHPUnit"],
  },
  {
    category: "Process & Languages",
    items: ["Agile", "Jira", "Trello", "English", "French", "Arabic (native)"],
  },
];

export const experience = [
  {
    company: "Iberis",
    role: "Full-Stack Developer (Vue.js | Laravel)",
    dates: "Dec 2025 – Present",
    summary: "Financial SaaS + HR/payroll + geo-attendance mobile app.",
    projectSlug: "iberis-finances",
  },
  {
    company: "NetAdvisor",
    role: "Full-Stack Developer (Angular | Laravel)",
    dates: "Sep 2024 – Jul 2025",
    summary: "Social-commerce backend, microservices, real-time chat.",
    projectSlug: "netadvisor",
  },
  {
    company: "AMA Business Tunisie",
    role: "Full-Stack Developer (Laravel | CodeIgniter | PHP)",
    dates: "May 2024 – Sep 2024",
    summary: "Public transit ticketing platform for STB Tunisia.",
    projectSlug: "stb-bus",
  },
  {
    company: "Next Consult",
    role: "Laravel Developer (Final Year Project)",
    dates: "Feb 2023 – Jul 2023",
    summary: "SaaS for community managers, Laravel 9 + PostgreSQL, social API scheduling and analytics dashboards.",
    projectSlug: null,
  },
];

export const education = [
  {
    degree: "Professional Master's Degree in E-Commerce",
    school: "Higher Institute of Management of Gabès (ISG Gabès)",
    dates: "Sep 2021 – Nov 2023",
  },
  {
    degree: "Applied Bachelor's Degree in Business Information Technology",
    school: "Higher School of Commerce of Sfax (ESC Sfax)",
    dates: "Sep 2017 – Sep 2020",
  },
];
