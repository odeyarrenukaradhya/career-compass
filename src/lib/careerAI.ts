/**
 * Career AI Service - Phase 2 Placeholder
 * 
 * This module will handle AI-powered career mapping and guidance.
 * Currently contains mock data and structure for future AI integration.
 * 
 * FUTURE INTEGRATION NOTES:
 * - Will integrate with OpenAI or similar LLM API
 * - Input: User's desired role, skills, experience, timeline
 * - Output: Personalized career roadmap with milestones
 */

export interface CareerRole {
  id: string;
  title: string;
  category: string;
  description: string;
  requiredSkills: string[];
  averageSalary: string;
}

export interface Milestone {
  id: string;
  week: number;
  title: string;
  description: string;
  skills: string[];
  resources: string[];
  completed: boolean;
}

export interface CareerRoadmap {
  role: string;
  duration: number; // in weeks
  milestones: Milestone[];
  generatedAt: string;
}

// Mock career roles available for selection
export const availableRoles: CareerRole[] = [
  {
    id: 'swe',
    title: 'Software Engineer',
    category: 'Engineering',
    description: 'Design, develop, and maintain software applications',
    requiredSkills: ['Programming', 'Data Structures', 'Algorithms', 'System Design'],
    averageSalary: '₹8-25 LPA',
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    category: 'Data Science',
    description: 'Analyze data to help organizations make better decisions',
    requiredSkills: ['SQL', 'Python', 'Statistics', 'Data Visualization'],
    averageSalary: '₹6-18 LPA',
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    category: 'Product',
    description: 'Lead product development and strategy',
    requiredSkills: ['Product Strategy', 'Analytics', 'Communication', 'UX'],
    averageSalary: '₹12-35 LPA',
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    category: 'Engineering',
    description: 'Bridge development and operations for faster delivery',
    requiredSkills: ['CI/CD', 'Cloud Platforms', 'Scripting', 'Containers'],
    averageSalary: '₹8-22 LPA',
  },
];

/**
 * Generate a career roadmap based on user preferences
 * 
 * FUTURE: This function will call an AI API to generate personalized roadmaps
 * 
 * @param roleId - The selected career role ID
 * @param durationWeeks - Timeline in weeks (4-52)
 * @returns Promise<CareerRoadmap> - Generated roadmap
 */
export const generateCareerRoadmap = async (
  roleId: string,
  durationWeeks: number
): Promise<CareerRoadmap> => {
  // TODO: Replace with actual AI API call
  // Example future implementation:
  // const response = await fetch('/api/ai/career-roadmap', {
  //   method: 'POST',
  //   body: JSON.stringify({ roleId, durationWeeks, userProfile }),
  // });
  // return response.json();

  // Mock response for now
  const role = availableRoles.find(r => r.id === roleId);
  if (!role) throw new Error('Role not found');

  const milestonesPerWeek = Math.ceil(durationWeeks / 4);
  const milestones: Milestone[] = [];

  for (let i = 0; i < 4; i++) {
    milestones.push({
      id: `milestone-${i + 1}`,
      week: (i + 1) * milestonesPerWeek,
      title: `Phase ${i + 1}: ${getMilestoneTitle(i, role.title)}`,
      description: getMilestoneDescription(i),
      skills: role.requiredSkills.slice(i, i + 1),
      resources: getResources(i),
      completed: false,
    });
  }

  return {
    role: role.title,
    duration: durationWeeks,
    milestones,
    generatedAt: new Date().toISOString(),
  };
};

// Helper functions for mock data
const getMilestoneTitle = (phase: number, role: string): string => {
  const titles = [
    'Foundation Building',
    'Core Skills Development',
    'Practical Application',
    'Interview Preparation',
  ];
  return titles[phase] || 'Continued Learning';
};

const getMilestoneDescription = (phase: number): string => {
  const descriptions = [
    'Build fundamental knowledge and set up your learning environment',
    'Deep dive into core technical skills required for the role',
    'Work on real projects and build your portfolio',
    'Prepare for interviews with mock sessions and problem solving',
  ];
  return descriptions[phase] || 'Continue skill development';
};

const getResources = (phase: number): string[] => {
  const resources = [
    ['Online courses', 'Documentation', 'YouTube tutorials'],
    ['Practice platforms', 'Books', 'Coding challenges'],
    ['GitHub projects', 'Hackathons', 'Open source'],
    ['Mock interviews', 'Resume building', 'Networking'],
  ];
  return resources[phase] || [];
};

/**
 * PLACEHOLDER: Get AI-powered skill recommendations
 * Future: Will analyze user's current skills and suggest gaps to fill
 */
export const getSkillRecommendations = async (
  currentSkills: string[],
  targetRole: string
): Promise<string[]> => {
  // TODO: Implement AI-based skill gap analysis
  console.log('AI skill recommendations not yet implemented');
  return ['Placeholder skill 1', 'Placeholder skill 2'];
};

/**
 * PLACEHOLDER: Get personalized learning resources
 * Future: Will use AI to curate resources based on learning style
 */
export const getPersonalizedResources = async (
  skill: string,
  learningStyle: 'visual' | 'reading' | 'hands-on'
): Promise<string[]> => {
  // TODO: Implement AI-curated resource recommendations
  console.log('AI resource recommendations not yet implemented');
  return ['Resource placeholder'];
};
