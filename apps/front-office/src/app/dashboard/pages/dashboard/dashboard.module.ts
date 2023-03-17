import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import {
  FullScreenModule,
  SafeButtonModule,
  SafeSkeletonModule,
  SafeWidgetGridModule,
} from '@oort-front/safe';
/**
 * Dashboard page.
 * Dashboard is one of the available content types of application pages.
 */
@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SafeWidgetGridModule,
    FullScreenModule,
    SafeSkeletonModule,
    SafeButtonModule,
  ],
  exports: [DashboardComponent],
})
export class DashboardModule {}
