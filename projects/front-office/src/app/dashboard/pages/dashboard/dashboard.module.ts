import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SafeWidgetGridModule } from '@safe/builder';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
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
    IndicatorsModule,
  ],
  exports: [DashboardComponent],
})
export class DashboardModule {}
