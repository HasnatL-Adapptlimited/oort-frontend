import {
  Component,
  OnInit,
  Inject,
  ChangeDetectorRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Apollo } from 'apollo-angular';
import {
  GET_GRID_RESOURCE_META,
  GetResourceByIdQueryResponse,
  GET_GRID_FORM_META,
  GetFormByIdQueryResponse,
  GetRecordByIdQueryResponse,
  GET_RECORD_BY_ID,
} from '../../../../graphql/queries';

/**
 * Card modal component.
 * Used as a Material Dialog.
 */
@Component({
  selector: 'safe-card-modal',
  templateUrl: './card-modal.component.html',
  styleUrls: ['./card-modal.component.scss'],
})
export class SafeCardModalComponent implements OnInit, AfterViewInit {
  @ViewChild('tabGroup') tabGroup: any;

  // === CURRENT TAB ===
  private activeTabIndex: number | undefined;

  // === RESOURCE DATA ===
  public dataset: any;

  // === GRID FOR RECORD SELECTION SETTINGS ===
  public gridSettings: any;

  // === RECORD DATA ===
  public loadedRecord: any;
  private recordSubscription: any;

  // === FORM WITH CARD SETTINGS INFORMATION ===
  public form: any;

  /**
   * Card modal component.
   * Used as a Material Dialog.
   *
   * @param dialogRef Material Dialog Ref of the component
   * @param fb Angular form builder
   * @param data dialog data
   * @param cdRef
   * @param apollo
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SafeCardModalComponent>,
    public fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private apollo: Apollo
  ) {}

  /**
   * Creates a formGroup with the data provided in the modal creation and gets the resource data used in the card.
   */
  ngOnInit(): void {
    this.form = this.fb.group({
      ...this.data,
      layout: [],
    });
    this.form.patchValue({ layout: this.data.layout ? this.data.layout : [] });

    this.form.controls.resource.valueChanges.subscribe((value: any) => {
      this.apollo
        .query<GetResourceByIdQueryResponse>({
          query: GET_GRID_RESOURCE_META,
          variables: {
            resource: value.resource.id,
          },
        })
        .subscribe((res2) => {
          if (res2.errors) {
            this.apollo
              .query<GetFormByIdQueryResponse>({
                query: GET_GRID_FORM_META,
                variables: {
                  id: value.resource.id,
                },
              })
              .subscribe((res3) => {
                if (res3.errors) {
                  this.dataset = null;
                } else {
                  this.dataset = null;
                }
              });
          } else {
            this.dataset = res2.data.resource;
            this.gridSettings = this.findLayout(
              this.dataset.layouts,
              this.form.value.layout[0]
            );
            if (!this.gridSettings) {
              this.form.patchValue({
                layout: [],
                record: null,
              });
            }
          }
        });
    });

    this.form.controls.layout.valueChanges.subscribe((value: any) => {
      if (this.dataset) {
        this.gridSettings = this.findLayout(this.dataset.layouts, value[0]);
      }
    });

    // Fetches the specified record data.

    if (this.form.value.record) {
      this.recordSubscription = this.apollo
        .watchQuery<GetRecordByIdQueryResponse>({
          query: GET_RECORD_BY_ID,
          variables: {
            id: this.form.value.record,
          },
        })
        .valueChanges.subscribe((res) => {
          if (res) {
            this.loadedRecord = res.data.record;
          } else {
            this.loadedRecord = null;
          }
        });
    }
    this.form.controls.record.valueChanges.subscribe((value: any) => {
      if (!this.loadedRecord || this.loadedRecord.id !== value) {
        if (this.recordSubscription) {
          this.recordSubscription.unsubscribe();
        }
        if (value) {
          this.recordSubscription = this.apollo
            .watchQuery<GetRecordByIdQueryResponse>({
              query: GET_RECORD_BY_ID,
              variables: {
                id: value,
              },
            })
            .valueChanges.subscribe((res) => {
              if (res) {
                this.loadedRecord = res.data.record;
              } else {
                this.loadedRecord = null;
              }
            });
        }
      }
    });
  }

  /**
   * Closes the modal without sending any data.
   */
  onClose(): void {
    this.dialogRef.close();
  }

  /**
   * Closes the modal sending the form data.
   */
  onSubmit(): void {
    this.dialogRef.close(this.form.value);
  }

  /**
   * Checks if the user is in the editor tab before loading it.
   *
   * @returns Returns a boolean.
   */
  isEditorTab(): boolean {
    return this.activeTabIndex === 3;
  }

  /**
   * Sets an internal variable with the current tab.
   *
   * @param e Change tab event.
   */
  handleTabChange(e: MatTabChangeEvent) {
    this.activeTabIndex = e.index;
  }

  /**
   * Initializes the active tab variable.
   */
  ngAfterViewInit() {
    this.activeTabIndex = this.tabGroup.selectedIndex;
    this.cdRef.detectChanges();
  }

  /**
   * Search the an specific layout in an array.
   *
   * @param layouts Array of layout objects.
   * @param layoutToFind String with the layout id to find.
   * @returns Returns the layout if found, if not null is returned.
   */
  private findLayout(layouts: any[], layoutToFind: string): any {
    let result = null;
    layouts.map((layout: any) => {
      if (layout.id === layoutToFind) {
        result = layout;
      }
    });
    return result;
  }
}
