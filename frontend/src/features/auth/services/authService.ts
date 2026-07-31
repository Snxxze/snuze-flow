import { apiClient } from '@/services/api/apiClient';
import {
  AuthResponse,
  authResponseSchema,
  LoginPayload,
  RegisterPayload,
  User,
  userSchema,
} from '../types/auth';

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/register', payload);
    return authResponseSchema.parse(response.data.data);
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/login', payload);
    return authResponseSchema.parse(response.data.data);
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get('/api/auth/me');
    return userSchema.parse(response.data.data);
  },
};
