import { User } from '@/features/auth/types/auth';

// =========================================================================================
// SECURITY WARNING / CAUTION:
// This Mock User is strictly for Local UI/UX Development without running Backend Services.
// MUST NEVER BE INCLUDED OR USED IN PRODUCTION BUILDS!
// =========================================================================================

export const MOCK_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'dev@snuze.flow',
  username: 'devuser',
  displayName: 'Dev Designer',
  createdAt: new Date().toISOString(),
};

export const MOCK_TOKEN = 'mock-dev-token-secret-xyz';
