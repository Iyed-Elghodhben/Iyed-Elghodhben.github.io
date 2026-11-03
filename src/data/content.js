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
    "I build the backbone of B2B SaaS products — multi-tenant Laravel and Vue.js systems that turn regulatory and operational complexity into software you can trust. Over the past three years I've shipped production systems across social commerce, public transit ticketing, and financial compliance in Tunisia. I'm most useful on the problems other developers avoid: exact calculation logic, tenant isolation, and the edge cases where a small mistake becomes an incident.",
  strengths: [
    {
      title: "Regulatory-grade engineering",
      detail:
        "Comfortable owning the parts of a system where correctness isn't optional — exact calculation logic, tax and compliance rules, and the edge cases that turn a rounding error into an incident.",
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
      "Tax & regulatory compliance",
      "Payroll & labor law",
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
    role: "Full-Stack Developer",
    dates: "Dec 2025 – Present",
    summary: "Details withheld at the employer's request.",
    projectSlug: null,
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
