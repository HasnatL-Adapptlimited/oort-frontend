import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  DateTimeProvider,
  OAuthLogger,
  OAuthService,
  UrlHelperService,
} from 'angular-oauth2-oidc';

import { SafeAuthService } from './auth.service';

describe('SafeAuthService', () => {
  let service: SafeAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OAuthService,
        UrlHelperService,
        OAuthLogger,
        DateTimeProvider,
      ],
      imports: [HttpClientModule],
    });
    service = TestBed.inject(SafeAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
