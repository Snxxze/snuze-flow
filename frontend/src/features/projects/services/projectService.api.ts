import { z } from 'zod';
import { apiClient } from '@/services/api/apiClient';
import {
  CreateProjectPayload,
  invitationSchema,
  InviteMemberPayload,
  Project,
  ProjectInvitation,
  projectSchema,
  ProjectStats,
  projectStatsSchema,
} from '../types/project';

export const apiProjectService = {
  async createProject(payload: CreateProjectPayload): Promise<Project> {
    const response = await apiClient.post('/api/projects', payload);
    return projectSchema.parse(response.data.data);
  },

  async listProjects(): Promise<Project[]> {
    const response = await apiClient.get('/api/projects');
    return z.array(projectSchema).parse(response.data.data);
  },

  async getProjectDetail(id: string): Promise<Project> {
    const response = await apiClient.get(`/api/projects/${id}`);
    return projectSchema.parse(response.data.data);
  },

  async inviteMember(projectId: string, payload: InviteMemberPayload): Promise<ProjectInvitation> {
    const response = await apiClient.post(`/api/projects/${projectId}/invitations`, payload);
    return invitationSchema.parse(response.data.data);
  },

  async listPendingInvitations(): Promise<ProjectInvitation[]> {
    const response = await apiClient.get('/api/invitations');
    return z.array(invitationSchema).parse(response.data.data);
  },

  async acceptInvitation(invitationId: string): Promise<void> {
    await apiClient.put(`/api/invitations/${invitationId}/respond`, { status: 'accepted' });
  },

  async rejectInvitation(invitationId: string): Promise<void> {
    await apiClient.put(`/api/invitations/${invitationId}/respond`, { status: 'rejected' });
  },

  async respondInvitation(invitationId: string, status: 'accepted' | 'rejected'): Promise<void> {
    await apiClient.put(`/api/invitations/${invitationId}/respond`, { status });
  },

  async updateProject(id: string, payload: Partial<CreateProjectPayload>): Promise<Project> {
    const response = await apiClient.patch(`/api/projects/${id}`, payload);
    return projectSchema.parse(response.data.data);
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/api/projects/${id}`);
  },

  async getProjectStats(projectId: string): Promise<ProjectStats> {
    const response = await apiClient.get(`/api/projects/${projectId}/stats`);
    return projectStatsSchema.parse(response.data.data);
  },
};
