import { CdkDragEnter, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IWidgetType, WIDGET_TYPES } from '../../models/dashboard.model';
import { SafeExpandedWidgetComponent } from './expanded-widget/expanded-widget.component';
import { TileLayoutReorderEvent, TileLayoutResizeEvent, TileLayoutItemComponent } from "@progress/kendo-angular-layout";

@Component({
  selector: 'safe-widget-grid',
  templateUrl: './widget-grid.component.html',
  styleUrls: ['./widget-grid.component.scss']
})
export class SafeWidgetGridComponent implements OnInit, AfterViewInit {

  public widgetTypes: IWidgetType[] = WIDGET_TYPES as IWidgetType[];

  @Input() widgets: any[] = [];
  @Input() canUpdate = false;

  // === GRID ===
  @ViewChildren(CdkDropList) dropsQuery?: QueryList<CdkDropList>;
  drops: CdkDropList[] = [];
  colsNumber = 8;

  // === EVENT EMITTER ===
  @Output() move: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();
  @Output() edit: EventEmitter<any> = new EventEmitter();
  @Output() add: EventEmitter<any> = new EventEmitter();

  // === STEP CHANGE FOR WORKFLOW ===
  @Output() goToNextStep: EventEmitter<any> = new EventEmitter();

  get dashboardMenuRowSpan(): number {
    if (this.widgets && this.widgets.length > 0) {
      const defaultRows = (this.widgets[this.widgets.length - 1].defaultRows === 4 &&
        this.widgets[this.widgets.length - 1].defaultCols === 8) ? 1 :
        this.widgets[this.widgets.length - 1].defaultRows;
      return (defaultRows > this.colsNumber) ? this.colsNumber : defaultRows;
    } else {
      return 1;
    }
  }

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.colsNumber = this.setColsNumber(window.innerWidth);
  }

  /*  Material grid once template ready.
  */
  ngAfterViewInit(): void {
    if (this.dropsQuery) {
      this.dropsQuery.changes.subscribe(() => {
        this.drops = this.dropsQuery?.toArray() || [];
      });
      Promise.resolve().then(() => {
        this.drops = this.dropsQuery?.toArray() || [];
      });
    }
  }

  /*  Change the number of displayed columns.
   */
  private setColsNumber(width: number): number {
    if (width <= 480) {
      return 1;
    }
    if (width <= 600) {
      return 2;
    }
    if (width <= 800) {
      return 4;
    }
    if (width <= 1024) {
      return 6;
    }
    return 8;
  }

  /*  Drag and drop a widget to move it.
  */
  onMove($event: CdkDragEnter): void {
    moveItemInArray(this.widgets, $event.item.data, $event.container.data);
    this.move.emit();
  }

  onEditWidget(e: any): void {
    this.edit.emit(e);
  }

  onDeleteWidget(e: any): void {
    this.delete.emit(e);
  }

  onExpandWidget(e: any): void {
    const widget = this.widgets.find(x => x.id === e.id);
    const dialogRef = this.dialog.open(SafeExpandedWidgetComponent, {
      data: {
        widget
      },
      autoFocus: false,
      position: {
        bottom: '0',
        right: '0'
      },
      panelClass: 'expanded-widget-dialog'
    });
    dialogRef.componentInstance.goToNextStep.subscribe((event: any) => {
      this.goToNextStep.emit(event);
      dialogRef.close();
    });
  }

  onAdd(e: any): void {
    this.add.emit(e);
  }

  public onReorder(e: TileLayoutReorderEvent): void {
    // prevent the default behavior
    e.preventDefault();
    // check whether the dragged item was dropped over another item
    const targetItem = e.items.filter((item: TileLayoutItemComponent) =>
      item.order === e.newIndex
    )[0];
      e.item.order = e.newIndex!;

    if (targetItem) {
      targetItem.order = e.oldIndex!;
    }
    console.log(this.widgets);
    this.widgets = this.array_move(this.widgets, e.oldIndex, e.newIndex);
    console.log(this.widgets);
    this.move.emit();
  }

  private array_move(arr: any, old_index: number, new_index: number) {
    let temp: Array<any> = [];
    arr.map((value: any) => {temp.push(value)})
    if (new_index >= temp.length) {
        var k = new_index - temp.length + 1;
        while (k--) {
            temp.push(undefined);
        }
    }
    temp.splice(new_index, 0, temp.splice(old_index, 1)[0]);
    return (temp); // for testing
};

  public onResize(e: TileLayoutResizeEvent) {
    e.item.rowSpan = e.newRowSpan;
    e.item.colSpan = e.newColSpan;
    const targetItem = e.items.filter((item) => item !== e.item)[0];

    if (targetItem && this.isOverlapping(e.item, targetItem)) {
      targetItem.row = e.item.row + e.item.rowSpan;
    }
    this.edit.emit({
      type: 'display',
      id: this.widgets[e.item.order].id,
      options: {
        id: this.widgets[e.item.order].id,
        cols: e.newColSpan,
        rows: e.newRowSpan
      }});
  }

  test(widget: any){
    console.log(widget);
  }

  private isOverlapping(
    resizedItem: TileLayoutItemComponent,
    otherItem: TileLayoutItemComponent
  ): boolean {
    const hasCommonColumns =
      resizedItem.col + resizedItem.colSpan - 1 >= otherItem.col;
    const hasCommonRows =
      resizedItem.row + resizedItem.rowSpan - 1 >= otherItem.row;
    return hasCommonColumns && hasCommonRows;
  }
}
