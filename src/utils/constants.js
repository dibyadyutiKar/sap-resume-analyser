// export const PHASE_APIS = {
//   "Pre-Implementation/Discovery": "http://3.26.210.235:8000/parsePdfPreImpl",
//   "Build/Configuration": "http://3.26.210.235:8000/parsePdfBuild",
//   Design: "http://3.26.210.235:8000/parsePdfDesign",
//   Testing: "http://3.26.210.235:8000/parsePdfTesting",
//   Deployment: "http://3.26.210.235:8000/parsePdfDeploymentGoLive",
//   "Post-Implementation": "http://3.26.210.235:8000/parsePdfPostImplementation",
// };
export const PHASE_APIS = {
  "Pre-Implementation/Discovery": "http://127.0.0.1:8000/parsePdfPreImpl",
  "Build/Configuration": "http://127.0.0.1:8000/parsePdfBuild",
  Design: "http://127.0.0.1:8000/parsePdfDesign",
  Testing: "http://127.0.0.1:8000/parsePdfTesting",
  Deployment: "http://127.0.0.1:8000/parsePdfDeploymentGoLive",
  "Post-Implementation": "http://127.0.0.1:8000/parsePdfPostImplementation",
};

// Mapping for API response keys to our internal phase names
// This handles the different key formats returned by each API
export const API_RESPONSE_KEYS = {
  "Pre-Implementation/Discovery": [
    "Pre-Implementation / Discovery",
    "Pre-Implementation/Discovery",
  ],
  "Build/Configuration": ["Build / Configuration", "Build/Configuration"],
  Design: ["Design"],
  Testing: ["Testing"],
  Deployment: ["Deployment / Cutover", "Deployment", "Cutover"],
  "Post-Implementation": ["Post-Go-Live / Run"],
};

export const PHASE_NAMES = Object.keys(PHASE_APIS);

// new experience endpoints
export const EXPERIENCE_APIS = {
  business_process_experience: "http://127.0.0.1:8000/TM/parsePdfBusinessTM",
  wricef_development_experience: "http://127.0.0.1:8000/TM/parsePdfWRICEFTM",
  integration_experience: "http://127.0.0.1:8000/parsePdfIntegration",
};
export const EXPERIENCE_NAMES = Object.keys(EXPERIENCE_APIS);

// Expected categories for each phase (for validation and UI hints)
export const PHASE_CATEGORIES = {
  "Pre-Implementation/Discovery": [
    "Requirements Gathering",
    "Fit-Gap Analysis",
    "Business Process Mapping",
    "Data Assessment & Cleansing Strategy",
    "Third-Party Solution Advisory",
  ],
  "Build/Configuration": [
    "SPRO/IMG Configuration",
    "WRICEF Object Development",
    "Integration Configuration",
  ],
  Design: [
    "Solution Design",
    "Functional Specifications",
    "Authorization & Security Design",
  ],
  Testing: [
    "Unit Testing",
    "System Integration Testing (SIT)",
    "User Acceptance Testing (UAT)",
    "Performance Testing",
  ],
  Deployment: [
    "Cutover Planning",
    "Business Readiness",
    "Go/No-Go Decision",
    "Production Deployment",
  ],
  "Post-Implementation": [
    "Hypercare Support",
    "Application Maintenance & Support (AMS)",
    "Continuous Improvement Enhancements",
  ],
};
