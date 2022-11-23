import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Aggregation } from '../../../models/aggregation.model';
import { Resource } from '../../../models/resource.model';
import { createAggregationForm } from '../../ui/aggregation-builder/aggregation-builder-forms';

/**
 * Interface describing the structure of the data displayed in the dialog
 */
interface DialogData {
  aggregation?: Aggregation;
  resource: Resource;
}

/**
 * Modal to edit aggregation.
 */
@Component({
  selector: 'safe-edit-aggregation-modal',
  templateUrl: './edit-aggregation-modal.component.html',
  styleUrls: ['./edit-aggregation-modal.component.scss'],
})
export class SafeEditAggregationModalComponent implements OnInit {
  public formGroup!: FormGroup;
  public resource!: Resource;
  // public templates: any[] = [];
  // public layoutPreviewData!: { form: FormGroup; defaultLayout: any };

  /**
   * Modal to edit aggregation.
   *
   * @param dialogRef This is the reference of the dialog that will be opened.
   * @param data This is the data that is passed to the modal when it is opened.
   */
  constructor(
    public dialogRef: MatDialogRef<SafeEditAggregationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.resource = this.data.resource;
    this.formGroup = createAggregationForm(this.data.aggregation);
    // TODO: edit with the parameters the aggregation has
    // this.formGroup = this.formBuilder.group({
    //   name: [this.data.aggregation?.name, Validators.required],
    //   query: createQueryForm(this.data.aggregation?.query),
    //   display: createDisplayForm(this.data.aggregation?.display),
    // });
    // this.layoutPreviewData = {
    //   form: this.form,
    //   defaultLayout: this.data.layout?.display,
    // };
    // this.form.get('display')?.valueChanges.subscribe((value: any) => {
    //   this.layoutPreviewData.defaultLayout = value;
    // });
  }

  /**
   * Closes the modal sending tile form value.
   */
  onSubmit(): void {
    this.dialogRef.close(this.formGroup?.getRawValue());
  }
}
