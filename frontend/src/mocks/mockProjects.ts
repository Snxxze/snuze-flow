import { Project, ProjectInvitation, ProjectStats } from '@/features/projects/types/project';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'SnuzeFlow Redesign',
    description: 'Personal project management web app UI redesign with Linear-style clean aesthetic',
    ownerId: '00000000-0000-0000-0000-000000000001',
    role: 'owner',
    createdAt: new Date().toISOString(),
    members: [
      {
        userId: '00000000-0000-0000-0000-000000000001',
        email: 'dev@snuze.flow',
        username: 'devuser',
        displayName: 'Dev Designer',
        role: 'owner',
        joinedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Marketing Campaign Q4',
    description: 'Product launch and social media outreach strategy for Q4',
    ownerId: '99999999-9999-9999-9999-999999999999',
    role: 'member',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    members: [
      {
        userId: '00000000-0000-0000-0000-000000000001',
        email: 'dev@snuze.flow',
        username: 'devuser',
        displayName: 'Dev Designer',
        role: 'member',
        joinedAt: new Date().toISOString(),
      },
    ],
  },
];

export const MOCK_INVITATIONS: ProjectInvitation[] = [];

export const MOCK_STATS: ProjectStats = {
  totalTasks: 8,
  todoTasks: 4,
  inProgressTasks: 3,
  doneTasks: 1,
  overdueTasks: 1,
  totalMembers: 2,
  completionRate: 12,
};
