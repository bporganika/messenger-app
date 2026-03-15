// Environment variables loaded from .env via react-native-config or
// build-time injection. Values are validated at app startup.

interface EnvConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
}

function requireEnv(name: string): string {
  // In production, these come from the build environment.
  // react-native-config or Xcode build settings inject them.
  const envVars: Record<string, string | undefined> = {
    API_BASE_URL: process.env['API_BASE_URL'],
    WS_BASE_URL: process.env['WS_BASE_URL'],
  };

  const value = envVars[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env: EnvConfig = {
  apiBaseUrl: requireEnv('API_BASE_URL'),
  wsBaseUrl: requireEnv('WS_BASE_URL'),
};
