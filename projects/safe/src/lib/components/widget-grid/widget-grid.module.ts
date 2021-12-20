import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeWidgetGridComponent } from './widget-grid.component';
import { SafeWidgetModule } from '../widget/widget.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SafeFloatingOptionsComponent } from './floating-options/floating-options.component';
import { SafeTileDataComponent } from './floating-options/menu/tile-data/tile-data.component';
import { SafeTileDisplayComponent } from './floating-options/menu/tile-display/tile-display.component';
import { SafeExpandedWidgetComponent } from './expanded-widget/expanded-widget.component';
import { MatDividerModule } from '@angular/material/divider';
import { SafeButtonModule } from '../ui/button/button.module';
import { SafeWidgetChoiceModule } from '../widget-choice/widget-choice.module';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { GridModule } from '@progress/kendo-angular-grid';

@NgModule({
  declarations: [
    SafeWidgetGridComponent,
    SafeFloatingOptionsComponent,
    SafeTileDataComponent,
    SafeTileDisplayComponent,
    SafeExpandedWidgetComponent
  ],
  imports: [
    CommonModule,
    SafeWidgetModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatGridListModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
    DragDropModule,
    MatDividerModule,
    SafeButtonModule,
    SafeWidgetChoiceModule,
    LayoutModule,
    ChartsModule,
    GridModule,
  ],
  exports: [SafeWidgetGridComponent]
})
export class SafeWidgetGridModule {
}
