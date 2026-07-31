import { apiProjectService } from './projectService.api';
import { mockProjectService } from './projectService.mock';

const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK === 'true';

// =========================================================================================
// SERVICE FACTORY PROVIDER:
// Automatically routes to mock implementation if VITE_USE_MOCK === 'true',
// or real API implementation if VITE_USE_MOCK === 'false'.
// =========================================================================================
export const projectService = IS_MOCK_MODE ? mockProjectService : apiProjectService;
