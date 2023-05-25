import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Http
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';

// Env
import { environment } from '../environments/environment';

// Config
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DialogModule as DialogCdkModule } from '@angular/cdk/dialog';

// TRANSLATOR
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { OAuthModule, OAuthService, OAuthStorage } from 'angular-oauth2-oidc';
import { MessageService } from '@progress/kendo-angular-l10n';
import {
  AppAbility,
  KendoTranslationService,
  SafeAuthInterceptorService,
} from '@oort-front/safe';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';

/** CASL */
import { PureAbility } from '@casl/ability';

// Register local translations for dates
registerLocaleData(localeFr);
registerLocaleData(localeEn);

// Importing the paginators translation service
import { MatPaginationIntlService } from '@oort-front/safe';

// Kendo datepicker for surveyjs
// import {
//   CalendarDOMService,
//   CenturyViewService,
//   DecadeViewService,
//   HoursService,
//   MinutesService,
//   MonthViewService,
//   TimePickerDOMService,
//   TOUCH_ENABLED,
//   YearViewService,
// } from '@progress/kendo-angular-dateinputs';
import { PopupService } from '@progress/kendo-angular-popup';
import { ResizeBatchService } from '@progress/kendo-angular-common';
import { IconsService } from '@progress/kendo-angular-icons';
// import { touchEnabled } from '@progress/kendo-common';
// Apollo / GraphQL
import { GraphQLModule } from './graphql.module';
import { MAT_LEGACY_TOOLTIP_DEFAULT_OPTIONS as MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/legacy-tooltip';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { MatPaginatorIntl } from '@angular/material/paginator';

// Fullscreen
import {
  OverlayContainer,
  FullscreenOverlayContainer,
} from '@angular/cdk/overlay';

/**
 * Initialize authentication in the platform.
 * Configuration in environment file.
 * Use oAuth
 *
 * @param oauth OAuth Service
 * @returns oAuth configuration
 */
const initializeAuth =
  (oauth: OAuthService): any =>
  () => {
    oauth.configure(environment.authConfig);
  };

/**
 * Sets up translator.
 *
 * @param http http client
 * @returns Translator.
 */
export const httpTranslateLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http);

/**
 * Main module of Front-Office project.
 */
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DialogCdkModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient],
      },
    }),
    OAuthModule.forRoot(),
    GraphQLModule,
    DateInputsModule,
  ],
  providers: [
    {
      provide: 'environment',
      useValue: environment,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      multi: true,
      deps: [OAuthService],
    },
    {
      provide: MessageService,
      useClass: KendoTranslationService,
    },
    // Default parameters of material tooltip
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: {
        showDelay: 500,
      },
    },
    {
      provide: OAuthStorage,
      useValue: localStorage,
    },
    // TODO: check
    // {
    //   provide: TOUCH_ENABLED,
    //   useValue: [touchEnabled],
    // },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SafeAuthInterceptorService,
      multi: true,
    },
    {
      provide: AppAbility,
      useValue: new AppAbility(),
    },
    {
      provide: PureAbility,
      useExisting: AppAbility,
    },
    {
      provide: MatPaginatorIntl,
      useClass: MatPaginationIntlService,
    },
    PopupService,
    ResizeBatchService,
    IconsService,
    { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
