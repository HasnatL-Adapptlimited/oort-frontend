import { AuthConfig } from 'angular-oauth2-oidc';
import { theme } from '../themes/default/default.uat';
import { sharedEnvironment } from './environment.shared';
import { Environment } from './environment.type';

/** Authentication configuration of the module. */
const authConfig: AuthConfig = {
  issuer:
    'https://login.microsoftonline.com/f610c0b7-bd24-4b39-810b-3dc280afb590/v2.0',
  redirectUri: 'https://ems-safe-test.who.int/',
  postLogoutRedirectUri: 'https://ems-safe-test.who.int/auth',
  clientId: '021202ac-d23b-4757-83e3-f6ecde12266b',
  scope: 'openid profile email offline_access',
  responseType: 'code',
  showDebugInformation: true,
  strictDiscoveryDocumentValidation: false,
};

/** Environment configuration */
export const environment: Environment = {
  ...sharedEnvironment,
  production: true,
  apiUrl: 'https://ems-safe-test.who.int/api',
  subscriptionApiUrl: 'wss://ems-safe-test.who.int/api',
  frontOfficeUri: 'https://ems-safe-test.who.int/',
  backOfficeUri: 'https://ems-safe-test.who.int/backoffice/',
  availableLanguages: ['en'],
  authConfig,
  theme,
  sentry: {
    environment: 'staging',
    dns: 'https://37ca208310369a4cee685fd50e1105ad@o4504696331632640.ingest.sentry.io/4505997745782784',
    tracePropagationTargets: ['ems-safe-test.who.int'],
  },
};
