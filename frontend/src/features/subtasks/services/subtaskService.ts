import { apiSubtaskService } from './subtaskService.api';
import { mockSubtaskService } from './subtaskService.mock';

const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK === 'true';

// =========================================================================================
// SERVICE FACTORY PROVIDER:
// Automatically routes to mock implementation if VITE_USE_MOCK === 'true',
// or real API implementation if VITE_USE_MOCK === 'false'.
// =========================================================================================
export const subtaskService = IS_MOCK_MODE ? mockSubtaskService : apiSubtaskService;
