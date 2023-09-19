import { FormsModule } from '@angular/forms';
import { IconModule } from '@oort-front/ui';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonTableModule } from '../../../skeleton/skeleton-table/skeleton-table.module';
import { RoleListComponent } from './role-list.component';
import {
  MenuModule,
  DividerModule,
  ButtonModule,
  TableModule,
  SpinnerModule,
  FormWrapperModule,
  SelectMenuModule,
  TooltipModule,
} from '@oort-front/ui';
import { AbilityModule } from '@casl/angular';
import { EmptyModule } from '../../../ui/empty/empty.module';

/**
 * BackOfficeRolesModule manages modules and components
 * related to the back-office roles tab
 */
@NgModule({
  declarations: [RoleListComponent],
  imports: [
    CommonModule,
    CommonModule,
    FormsModule,
    SpinnerModule,
    MenuModule,
    IconModule,
    DividerModule,
    TranslateModule,
    SkeletonTableModule,
    AbilityModule,
    ButtonModule,
    TableModule,
    FormWrapperModule,
    EmptyModule,
    SelectMenuModule,
    TooltipModule,
  ],
  exports: [RoleListComponent],
})
export class RoleListModule {}
