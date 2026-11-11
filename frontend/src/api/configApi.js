import { request } from './client';
import { API_PATHS } from './paths';

export const configApi = {
  get: () => request('GET', API_PATHS.config),
};
