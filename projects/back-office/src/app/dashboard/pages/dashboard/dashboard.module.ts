import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { WhoAccessModule } from '@who-ems';
import { ShareUrlComponent } from './components/share-url/share-url.component';
import { FloatingMenuComponent } from './components/floating-menu/floating-menu.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { WhoWidgetGridModule } from '@who-ems';

@NgModule({
  declarations: [
    DashboardComponent,
    ShareUrlComponent,
    FloatingMenuComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    WhoAccessModule,
    WhoWidgetGridModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
    ClipboardModule,
  ],
  exports: [DashboardComponent]
})
export class DashboardModule { }
