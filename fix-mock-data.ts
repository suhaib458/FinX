import fs from 'fs';

const filePath = 'src/lib/projects.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const mockData = `
const MOCK_PROJECTS: Project[] = [
  {
    id: "mock1",
    name: "TechVision Solutions",
    founderId: "founder1",
    founderName: "Ahmad Sami",
    category: "قطاع التكنولوجيا",
    stage: "Prototype",
    fundingNeeded: 50000,
    moneyReceived: 15000,
    expectedReturn: "10-15%",
    problem: "Lack of efficient technical solutions for small businesses.",
    solution: "An integrated cloud-based SaaS platform.",
    audience: "SMEs in MENA region",
    marketSize: "$500M",
    riskLevel: "Medium",
    timeline: "12 months",
    location: "عمان",
    summary: "Cloud SaaS for MENA SMEs.",
    status: "active"
  },
  {
    id: "mock2",
    name: "AgriGrow Innovation",
    founderId: "founder2",
    founderName: "Sara Ali",
    category: "القطاع الزراعي",
    stage: "Idea",
    fundingNeeded: 25000,
    moneyReceived: 5000,
    expectedReturn: "20%",
    problem: "Water scarcity in farming.",
    solution: "Smart IoT irrigation systems.",
    audience: "Local farmers",
    marketSize: "$100M",
    riskLevel: "High",
    timeline: "6 months",
    location: "إربد",
    summary: "Smart irrigation for water saving.",
    status: "active"
  },
  {
    id: "mock3",
    name: "FinTech Hub",
    founderId: "founder3",
    founderName: "Omar Hassan",
    category: "تقنية مالية",
    stage: "In progress",
    fundingNeeded: 100000,
    moneyReceived: 60000,
    expectedReturn: "15%",
    problem: "Complicated local payment gateways.",
    solution: "Seamless unified payment API.",
    audience: "E-commerce startups",
    marketSize: "$1B",
    riskLevel: "Low",
    timeline: "18 months",
    location: "عمان",
    summary: "Unified payment API for E-commerce.",
    status: "active"
  }
];
`;

content = content.replace(/export const getProjects = async \(\): Promise<Project\[\]> => \{/, mockData + '\nexport const getProjects = async (): Promise<Project[]> => {');

content = content.replace(/return snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \} as Project\)\);/, `const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    if (results.length === 0) return MOCK_PROJECTS;
    return results;`);

content = content.replace(/return \[\];/, 'return MOCK_PROJECTS;');

fs.writeFileSync(filePath, content);
console.log("Mock data injected");
