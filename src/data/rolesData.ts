import { JobRoleDetail, JobRoleKey } from '../types/eligibility';

export const JOB_ROLES: Record<JobRoleKey, JobRoleDetail> = {
  'python-developer': {
    id: 'python-developer',
    title: 'Python Developer',
    roleTag: 'Backend & Automation',
    shortDescription: 'Build scalable server-side systems, REST/GraphQL APIs, background workers, and automation pipelines.',
    longDescription: 'Designs, develops, and deploys high-performance backend microservices using Python ecosystems like FastAPI, Django, and Flask, with robust database modeling and containerized environments.',
    keySkills: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Docker', 'Git', 'REST APIs', 'Redis'],
    niceToHaveSkills: ['Celery', 'Kubernetes', 'AWS', 'GraphQL', 'Pytest', 'CI/CD'],
    minimumEducation: ["Bachelor's Degree", "Master's Degree"],
    preferredBranches: ['Computer Science', 'Information Technology', 'Software Engineering', 'Electrical & Computer'],
    benchmarkExperienceYears: 2,
    marketDemand: 'High',
    avgSalaryRange: '$95,000 - $145,000'
  },
  'data-analyst': {
    id: 'data-analyst',
    title: 'Data Analyst',
    roleTag: 'Business Intelligence',
    shortDescription: 'Transform raw data into strategic business insights using SQL, statistical analysis, and interactive dashboards.',
    longDescription: 'Extracts, wrangles, and analyzes complex business datasets. Builds interactive Tableau/PowerBI visual dashboards, designs relational reporting marts, and communicates quantitative metrics to executives.',
    keySkills: ['SQL', 'Python', 'Power BI', 'Tableau', 'Excel', 'Data Visualization', 'Statistical Analysis', 'ETL'],
    niceToHaveSkills: ['Snowflake', 'dbt', 'BigQuery', 'R', 'A/B Testing'],
    minimumEducation: ["Bachelor's Degree", "Master's Degree"],
    preferredBranches: ['Data Science', 'Statistics', 'Computer Science', 'Mathematics', 'Economics', 'Information Systems'],
    benchmarkExperienceYears: 1,
    marketDemand: 'High',
    avgSalaryRange: '$80,000 - $120,000'
  },
  'machine-learning-engineer': {
    id: 'machine-learning-engineer',
    title: 'Machine Learning Engineer',
    roleTag: 'Applied AI & MLOps',
    shortDescription: 'Productionize deep learning and predictive models, building robust MLOps pipelines and inference serving systems.',
    longDescription: 'Bridges data science research with enterprise engineering. Trains, evaluates, quantizes, and packages ML models into scalable low-latency endpoints using PyTorch, Triton, Docker, and Kubernetes.',
    keySkills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'MLOps', 'Docker', 'FastAPI', 'Vector Databases'],
    niceToHaveSkills: ['Kubeflow', 'MLflow', 'CUDA', 'Transformer Architecture', 'Hugging Face', 'AWS SageMaker'],
    minimumEducation: ["Bachelor's Degree", "Master's Degree", 'Doctorate'],
    preferredBranches: ['Computer Science', 'Artificial Intelligence', 'Data Science', 'Electrical Engineering', 'Robotics'],
    benchmarkExperienceYears: 2,
    marketDemand: 'Critical',
    avgSalaryRange: '$125,000 - $185,000'
  },
  'data-scientist': {
    id: 'data-scientist',
    title: 'Data Scientist',
    roleTag: 'Advanced Analytics & AI',
    shortDescription: 'Formulate hypotheses, build statistical predictive models, and leverage machine learning to solve complex problems.',
    longDescription: 'Combines algorithmic modeling, probabilistic inference, and experimental design to extract predictive knowledge from vast unstructured and structured datasets.',
    keySkills: ['Python', 'R', 'Machine Learning', 'Statistical Modeling', 'SQL', 'Pandas', 'NumPy', 'Data Mining'],
    niceToHaveSkills: ['NLP', 'Time Series Analysis', 'Spark', 'Causal Inference', 'Deep Learning'],
    minimumEducation: ["Bachelor's Degree", "Master's Degree", 'Doctorate'],
    preferredBranches: ['Data Science', 'Statistics', 'Computer Science', 'Applied Mathematics', 'Physics'],
    benchmarkExperienceYears: 2,
    marketDemand: 'Very High',
    avgSalaryRange: '$115,000 - $170,000'
  },
  'web-developer': {
    id: 'web-developer',
    title: 'Web Developer',
    roleTag: 'Full-Stack & Frontend',
    shortDescription: 'Engineer responsive web applications with modern frontend frameworks, accessible UI, and seamless APIs.',
    longDescription: 'Creates high-conversion, accessible, and fast web applications across the modern React/Next.js/TypeScript ecosystem with tight backend service integrations and responsive Tailwind CSS layouts.',
    keySkills: ['JavaScript', 'TypeScript', 'React', 'HTML/CSS', 'Node.js', 'Tailwind CSS', 'Git', 'REST APIs'],
    niceToHaveSkills: ['Next.js', 'PostgreSQL', 'GraphQL', 'Jest/Vitest', 'Web Performance', 'CI/CD'],
    minimumEducation: ["Bachelor's Degree", "Diploma / Associate", "Master's Degree"],
    preferredBranches: ['Computer Science', 'Information Technology', 'Software Engineering', 'Web Design'],
    benchmarkExperienceYears: 1,
    marketDemand: 'High',
    avgSalaryRange: '$85,000 - $135,000'
  },
  'software-developer': {
    id: 'software-developer',
    title: 'Software Developer',
    roleTag: 'Systems & Core Engineering',
    shortDescription: 'Architect robust distributed software, object-oriented design patterns, reliable services, and algorithms.',
    longDescription: 'Solves core software challenges across distributed microservices, clean architecture, algorithm design, relational transactions, test automation, and resilient cloud deployments.',
    keySkills: ['Java', 'C++', 'Python', 'Data Structures & Algorithms', 'SQL', 'Git', 'System Design', 'OOP'],
    niceToHaveSkills: ['Go', 'Spring Boot', 'Microservices', 'Docker', 'Kubernetes', 'Cloud Infrastructure'],
    minimumEducation: ["Bachelor's Degree", "Master's Degree"],
    preferredBranches: ['Computer Science', 'Software Engineering', 'Information Technology', 'Computer Engineering'],
    benchmarkExperienceYears: 2,
    marketDemand: 'Very High',
    avgSalaryRange: '$105,000 - $160,000'
  }
};

export const POPULAR_SKILLS = [
  'Python',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'FastAPI',
  'Django',
  'SQL',
  'PostgreSQL',
  'Docker',
  'Git',
  'PyTorch',
  'TensorFlow',
  'Scikit-Learn',
  'Machine Learning',
  'Power BI',
  'Tableau',
  'Pandas',
  'NumPy',
  'HTML/CSS',
  'Tailwind CSS',
  'Java',
  'C++',
  'Data Structures & Algorithms',
  'AWS',
  'REST APIs',
  'Redis',
  'MLOps'
];

export const EDUCATION_LEVELS = [
  "Bachelor's Degree (B.Tech / B.E. / B.S. / B.Sc / B.C.A.)",
  "Master's Degree (M.Tech / M.S. / M.Sc / M.C.A.)",
  'Doctorate / Ph.D.',
  'Diploma / Associate Degree',
  'High School / Self-Taught'
];

export const BRANCH_OPTIONS = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Artificial Intelligence & Data Science (AI/DS)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical Engineering (EE)',
  'Data Science & Statistics',
  'Mechanical / Civil / Other Engineering',
  'Mathematics / Physics / Applied Sciences',
  'Business / Economics / Finance',
  'Non-Technical / Other'
];

export const EXPERIENCE_LEVELS = [
  { value: '0', label: '0 Years (Fresher / Student)' },
  { value: '1', label: '1 Year (Early Associate)' },
  { value: '2', label: '2 Years (Mid-Junior)' },
  { value: '3', label: '3-4 Years (Mid-Level)' },
  { value: '5', label: '5+ Years (Senior Engineer)' }
];

export const SAMPLE_PROFILES = [
  {
    name: 'Alex Rivera (ML Aspirant)',
    fullName: 'Alex Rivera',
    educationLevel: "Bachelor's Degree (B.Tech / B.E. / B.S. / B.Sc / B.C.A.)",
    branch: 'Computer Science & Engineering (CSE)',
    cgpa: '8.7',
    technicalSkills: ['Python', 'PyTorch', 'Scikit-Learn', 'Pandas', 'NumPy', 'Git', 'SQL', 'FastAPI'],
    yearsOfExperience: '1',
    certifications: ['DeepLearning.AI TensorFlow Specialization', 'AWS Cloud Practitioner'],
    targetRole: 'machine-learning-engineer' as JobRoleKey
  },
  {
    name: 'Priya Sharma (Data Analyst)',
    fullName: 'Priya Sharma',
    educationLevel: "Bachelor's Degree (B.Tech / B.E. / B.S. / B.Sc / B.C.A.)",
    branch: 'Information Technology (IT)',
    cgpa: '8.1',
    technicalSkills: ['SQL', 'Python', 'Power BI', 'Excel', 'Tableau', 'Data Visualization', 'Pandas'],
    yearsOfExperience: '2',
    certifications: ['Google Data Analytics Professional Certificate', 'Microsoft PL-300'],
    targetRole: 'data-analyst' as JobRoleKey
  },
  {
    name: 'David Chen (Full Stack Web)',
    fullName: 'David Chen',
    educationLevel: "Bachelor's Degree (B.Tech / B.E. / B.S. / B.Sc / B.C.A.)",
    branch: 'Computer Science & Engineering (CSE)',
    cgpa: '8.4',
    technicalSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'HTML/CSS', 'Tailwind CSS', 'Git', 'REST APIs', 'PostgreSQL'],
    yearsOfExperience: '2',
    certifications: ['Meta Front-End Developer Professional'],
    targetRole: 'web-developer' as JobRoleKey
  }
];
