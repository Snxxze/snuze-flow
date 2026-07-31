import { MOCK_INVITATIONS, MOCK_PROJECTS, MOCK_TASKS } from '@/mocks';
import {
  CreateProjectPayload,
  InviteMemberPayload,
  Project,
  ProjectInvitation,
  ProjectStats,
} from '../types/project';

// =========================================================================================
// SECURITY / DEV NOTICE:
// This Mock Implementation is used strictly when VITE_USE_MOCK === 'true'.
// CAN BE SAFELY DELETED OR DISCARDED WHEN ONLY REAL BACKEND IS NEEDED.
// =========================================================================================

export const mockProjectService = {
  async createProject(payload: CreateProjectPayload): Promise<Project> {
    const newProj: Project = {
      id: crypto.randomUUID(),
      name: payload.name,
      description: payload.description,
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
    };
    MOCK_PROJECTS.push(newProj);
    return newProj;
  },

  async listProjects(): Promise<Project[]> {
    return MOCK_PROJECTS;
  },

  async getProjectDetail(id: string): Promise<Project> {
    return MOCK_PROJECTS.find((p) => p.id === id) || MOCK_PROJECTS[0];
  },

  async inviteMember(projectId: string, _payload: InviteMemberPayload): Promise<ProjectInvitation> {
    const newInv: ProjectInvitation = {
      id: crypto.randomUUID(),
      projectId,
      projectName: 'SnuzeFlow Redesign',
      invitedBy: 'Dev Designer',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    MOCK_INVITATIONS.push(newInv);
    return newInv;
  },

  async listPendingInvitations(): Promise<ProjectInvitation[]> {
    return MOCK_INVITATIONS;
  },

  async acceptInvitation(invitationId: string): Promise<void> {
    const idx = MOCK_INVITATIONS.findIndex((i) => i.id === invitationId);
    if (idx !== -1) MOCK_INVITATIONS.splice(idx, 1);
  },

  async rejectInvitation(invitationId: string): Promise<void> {
    const idx = MOCK_INVITATIONS.findIndex((i) => i.id === invitationId);
    if (idx !== -1) MOCK_INVITATIONS.splice(idx, 1);
  },

  async respondInvitation(invitationId: string, _status: 'accepted' | 'rejected'): Promise<void> {
    const idx = MOCK_INVITATIONS.findIndex((i) => i.id === invitationId);
    if (idx !== -1) MOCK_INVITATIONS.splice(idx, 1);
  },

  async updateProject(id: string, payload: Partial<CreateProjectPayload>): Promise<Project> {
    const proj = MOCK_PROJECTS.find((p) => p.id === id) || MOCK_PROJECTS[0];
    if (payload.name) proj.name = payload.name;
    if (payload.description) proj.description = payload.description;
    return proj;
  },

  async deleteProject(id: string): Promise<void> {
    const idx = MOCK_PROJECTS.findIndex((p) => p.id === id);
    if (idx !== -1) MOCK_PROJECTS.splice(idx, 1);
  },

  async getProjectStats(projectId: string): Promise<ProjectStats> {
    const projTasks = MOCK_TASKS.filter((t) => t.projectId === projectId);
    const totalTasks = projTasks.length;
    const todoTasks = projTasks.filter((t) => t.status === 'todo').length;
    const inProgressTasks = projTasks.filter((t) => t.status === 'in_progress').length;
    const doneTasks = projTasks.filter((t) => t.status === 'done').length;
    const now = new Date();
    const overdueTasks = projTasks.filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now).length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks * 100) / totalTasks) : 0;

    return {
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      totalMembers: 2,
      completionRate,
    };
  },
};
