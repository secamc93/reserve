export const serverConfig = {

  API_BASE_URL: process.env.API_BASE_URL || 
  (process.env.NODE_ENV === 'production' ? 'http://central_reserve:3050' : 'http://localhost:3050'),
  
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOGIN_REDIRECT_URL: process.env.LOGIN_REDIRECT_URL || '/calendar',
  LOGOUT_REDIRECT_URL: process.env.LOGOUT_REDIRECT_URL || '/auth/login',
};


export function getApiBaseUrl(): string {
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
    return 'http://localhost:3050';
  }
  
  return serverConfig.API_BASE_URL;
}

export function isLocalDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' && 
         !process.env.DOCKER_ENV && 
         typeof window === 'undefined';
} 