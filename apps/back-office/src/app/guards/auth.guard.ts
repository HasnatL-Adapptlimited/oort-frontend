import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SafeAuthService } from '@oort-front/safe';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Auth Guard. Checks that the user is authenticated.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  /**
   * Constructor of the authgard injectable
   *
   * @param authService The authentification service
   * @param router The router client
   */
  constructor(private authService: SafeAuthService, private router: Router) {}

  /**
   * Check if user can activate the route
   *
   * @returns A boolean indicating if the user can activate the route
   */
  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.canActivateProtectedRoutes$.pipe(
      tap((x) => {
        if (x) {
          return true;
        } else {
          this.router.navigate(['/auth']);
          return false;
        }
      })
    );
  }
}
