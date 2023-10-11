import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
// Sentry
import * as Sentry from '@sentry/angular-ivy';

Sentry.init({
  environment: 'frontend front office',
  dsn: 'https://37ca208310369a4cee685fd50e1105ad@o4504696331632640.ingest.sentry.io/4505997745782784',
  // Registers and configures the Tracing integration, automatically
  // instruments your application (highly recommended) to monitor its
  // performance, including custom Angular routing instrumentation
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
    // Registers the Replay integration,
    // which automatically captures Session Replays
    new Sentry.Replay(),
  ],
  // We recommend adjusting this value in production, or using tracesSampler for finer control
  tracesSampleRate: 1.0,
  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  // tracePropagationTargets: environment.sentry.tracePropagationTargets,
  tracePropagationTargets: ['localhost'],
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
