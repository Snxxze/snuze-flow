import { z } from 'zod';

export const projectMemberSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  username: z.string(),
  displayName: z.string(),
  role: z.enum(['owner', 'member']),
  joinedAt: z.string(),
});

export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  ownerId: z.string().uuid(),
  role: z.enum(['owner', 'member']).optional(),
  createdAt: z.string(),
  completionRate: z.number().optional(),
  members: z.array(projectMemberSchema).optional(),
});

export const invitationSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  projectName: z.string(),
  invitedBy: z.string(),
  status: z.enum(['pending', 'accepted', 'rejected']),
  createdAt: z.string(),
});

export type ProjectMember = z.infer<typeof projectMemberSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectInvitation = z.infer<typeof invitationSchema>;

export const projectStatsSchema = z.object({
  totalTasks: z.number(),
  todoTasks: z.number(),
  inProgressTasks: z.number(),
  doneTasks: z.number(),
  overdueTasks: z.number(),
  totalMembers: z.number(),
  completionRate: z.number(),
});

export type ProjectStats = z.infer<typeof projectStatsSchema>;

export interface CreateProjectPayload {
  name: string;
  description: string;
}

export interface InviteMemberPayload {
  email: string;
}
