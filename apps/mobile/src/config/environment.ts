import Constants from 'expo-constants';

// Environment variables are available through Constants.expoConfig.extra
// We'll define them in app.json under the "extra" section

interface EnvironmentConfig {
  API_BASE_URL: string;
  APP_NAME: string;
  APP_VERSION: string;
  NODE_ENV: 'development' | 'production' | 'test';
  DEBUG: boolean;
}

// Get environment variables from app.json extra section
const getEnvironmentConfig = (): EnvironmentConfig => {
  const extra = Constants.expoConfig?.extra || {};

  return {
    API_BASE_URL: 'http://localhost:8080/v1/api',
    APP_NAME: extra.APP_NAME || 'Fucci',
    APP_VERSION: extra.APP_VERSION || '1.0.0',
    NODE_ENV:
      (extra.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
    DEBUG: extra.DEBUG === 'true' || extra.DEBUG === true,
  };
};

export const environment = getEnvironmentConfig();

// Helper functions for common environment checks
export const isDevelopment = () => environment.NODE_ENV === 'development';
export const isProduction = () => environment.NODE_ENV === 'production';
export const isDebug = () => environment.DEBUG;

// API configuration
export const apiConfig = {
  baseURL: environment.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default environment;
