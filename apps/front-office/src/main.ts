import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
// Sentry
import * as Sentry from '@sentry/angular-ivy';
import { environment } from './environments/environment';

if (environment.sentry) {
  Sentry.init({
    dsn: 'https://37ca208310369a4cee685fd50e1105ad@o4504696331632640.ingest.sentry.io/4505997745782784',
    // Registers and configures the Tracing integration, automatically
    // instruments your application (highly recommended) to monitor its
    // performance, including custom Angular routing instrumentation
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
    ],
    // We recommend adjusting this value in production, or using tracesSampler for finer control
    tracesSampleRate: 1.0,
    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  });
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
