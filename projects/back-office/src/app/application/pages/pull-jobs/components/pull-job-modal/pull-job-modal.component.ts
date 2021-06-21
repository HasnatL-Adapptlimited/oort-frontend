import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiConfiguration, Channel, Form, PullJob, status } from '@safe/builder';
import { Apollo } from 'apollo-angular';
import { GetApiConfigurationsQueryResponse, GetFormByIdQueryResponse, GetFormsQueryResponse, GET_API_CONFIGURATIONS, GET_FORM_BY_ID, GET_FORM_NAMES } from 'projects/back-office/src/app/graphql/queries';
import { Subscription } from 'rxjs';
import { SubscriptionModalComponent } from '../../../subscriptions/components/subscription-modal/subscription-modal.component';
@Component({
  selector: 'app-pull-job-modal',
  templateUrl: './pull-job-modal.component.html',
  styleUrls: ['./pull-job-modal.component.scss']
})
export class PullJobModalComponent implements OnInit {

  // === REACTIVE FORM ===
  pullJobForm: FormGroup = new FormGroup({});

  // === DATA ===
  public forms: Form[] = [];
  public apiConfigurations: ApiConfiguration[] = [];
  public statusChoices = Object.values(status);
  public fields: any[] = [];
  private fieldsSubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<SubscriptionModalComponent>,
    private apollo: Apollo,
    @Inject(MAT_DIALOG_DATA) public data: {
      channels: Channel[];
      pullJob?: PullJob
    }
  ) { }

  ngOnInit(): void {
    this.pullJobForm = this.formBuilder.group({
      name: [this.data.pullJob ? this.data.pullJob.name : '', Validators.required],
      status: [this.data.pullJob ? this.data.pullJob.status : '', Validators.required],
      apiConfiguration: [(this.data.pullJob && this.data.pullJob.apiConfiguration)
        ? this.data.pullJob.apiConfiguration.id : '', Validators.required],
      schedule: [this.data.pullJob ? this.data.pullJob.schedule : ''],
      convertTo: [(this.data.pullJob && this.data.pullJob.convertTo) ? this.data.pullJob.convertTo.id : ''],
      channel: [(this.data.pullJob && this.data.pullJob.channel) ? this.data.pullJob.channel.id : ''],
      mapping: this.formBuilder.array(this.data.pullJob && this.data.pullJob.mapping
        ? Object.keys(this.data.pullJob.mapping).map((x: any) => this.formBuilder.group({
          name: [x, Validators.required],
          value: [this.data.pullJob?.mapping[x], Validators.required],
        }))
        : []),
    });
    this.apollo.watchQuery<GetFormsQueryResponse>({
      query: GET_FORM_NAMES
    }).valueChanges.subscribe((res: any) => {
      this.forms = res.data.forms;
    });
    this.apollo.watchQuery<GetApiConfigurationsQueryResponse>({
      query: GET_API_CONFIGURATIONS
    }).valueChanges.subscribe( res => {
      if (res) {
        this.apiConfigurations = res.data.apiConfigurations;
      }
    });

    // Fetch form fields if any for mapping
    if (this.data.pullJob?.convertTo?.id) {
      this.getFields(this.data.pullJob?.convertTo.id);
    }
    this.pullJobForm.get('convertTo')?.valueChanges.subscribe(res => {
      if (res) {
        this.getFields(res);
      }
    });
  }

  /*  Get fields from form id.
  */
  private getFields(id: string): void {
    if (this.fieldsSubscription) {
      this.fieldsSubscription.unsubscribe();
    }
    this.fieldsSubscription = this.apollo.watchQuery<GetFormByIdQueryResponse>({
      query: GET_FORM_BY_ID,
      variables: {
        id
      }
    }).valueChanges.subscribe(resForm => {
      if (resForm.data.form) {
        this.fields = resForm.data.form.fields || [];
      }
    });
  }

  get mappingArray(): FormArray {
    return this.pullJobForm.get('mapping') as FormArray;
  }

  /*  Add new element for the mapping.
  */
  onDeleteElement(index: number): void {
    this.mappingArray.removeAt(index);
  }

  /*  Remove element from the mapping.
  */
  onAddElement(): void {
    this.mappingArray.push(this.formBuilder.group({
      name: ['', Validators.required],
      value: ['', Validators.required]
    }));
  }

  /*  Close the modal without sending any data.
  */
  onClose(): void {
    this.dialogRef.close();
  }
}
