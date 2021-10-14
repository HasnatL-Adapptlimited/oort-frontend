import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ApiConfiguration, Channel, Form, PullJob, status } from '@safe/builder';
import { Apollo, QueryRef } from 'apollo-angular';
import {
  GetApiConfigurationsQueryResponse, GET_API_CONFIGURATIONS,
  GetFormByIdQueryResponse, GET_FORM_BY_ID,
  GetFormsQueryResponse, GET_FORM_NAMES
} from 'projects/back-office/src/app/graphql/queries';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { SubscriptionModalComponent } from '../../../subscriptions/components/subscription-modal/subscription-modal.component';

const ITEMS_PER_PAGE = 10;

@Component({
  selector: 'app-pull-job-modal',
  templateUrl: './pull-job-modal.component.html',
  styleUrls: ['./pull-job-modal.component.scss']
})
export class PullJobModalComponent implements OnInit {

  // === REACTIVE FORM ===
  pullJobForm: FormGroup = new FormGroup({});

  // === FORMS ===
  @ViewChild('formSelect') formSelect?: MatSelect;
  private formsLoading = true;
  private forms = new BehaviorSubject<Form[]>([]);
  public forms$!: Observable<Form[]>;
  private formsQuery!: QueryRef<GetFormsQueryResponse>;
  private formsPageInfo = {
    endCursor: '',
    hasNextPage: true
  };

  // === API ===
  @ViewChild('apiSelect') apiSelect?: MatSelect;
  private apiConfigurationsLoading = true;
  public apiConfigurations = new BehaviorSubject<ApiConfiguration[]>([]);
  public apiConfigurations$!: Observable<ApiConfiguration[]>;
  private apiConfigurationsQuery!: QueryRef<GetApiConfigurationsQueryResponse>;
  private apiPageInfo = {
    endCursor: '',
    hasNextPage: true
  };

  public loading = true;
  public statusChoices = Object.values(status);
  public fields: any[] = [];
  private fieldsSubscription?: Subscription;

  // === RAW JSON UTILITY ===
  public openRawJSON = false;

  get mappingArray(): FormArray {
    return this.pullJobForm.get('mapping') as FormArray;
  }

  get defaultApiConfiguration(): ApiConfiguration | null {
    return this.data.pullJob?.apiConfiguration || null;
  }

  get defaultForm(): Form | null {
    return this.data.pullJob?.convertTo || null;
  }

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
      rawMapping: [this.data.pullJob && this.data.pullJob.mapping ? JSON.stringify(this.data.pullJob?.mapping, null, 2) : ''],
      uniqueIdentifiers: [this.data.pullJob && this.data.pullJob.uniqueIdentifiers ? this.data.pullJob.uniqueIdentifiers : []]
    });
    this.formsQuery = this.apollo.watchQuery<GetFormsQueryResponse>({
      query: GET_FORM_NAMES,
      variables: {
        first: ITEMS_PER_PAGE
      }
    });

    this.forms$ = this.forms.asObservable();
    this.formsQuery.valueChanges.subscribe(res => {
      const nodes = res.data.forms.edges.map(x => x.node);
      if (this.defaultForm) {
        this.forms.next([this.defaultForm, ...nodes.filter(x => x.id !== this.defaultForm?.id)]);
      }
      this.formsPageInfo = res.data.forms.pageInfo;
      this.formsLoading = res.loading;
      this.loading = false && this.apiConfigurationsLoading;
    });

    this.apiConfigurationsQuery = this.apollo.watchQuery<GetApiConfigurationsQueryResponse>({
      query: GET_API_CONFIGURATIONS,
        variables: {
          first: ITEMS_PER_PAGE
        }
    });

    this.apiConfigurations$ = this.apiConfigurations.asObservable();
    this.apiConfigurationsQuery.valueChanges.subscribe(res => {
      const nodes = res.data.apiConfigurations.edges.map(x => x.node);
      if (this.defaultApiConfiguration) {
        this.apiConfigurations.next([this.defaultApiConfiguration, ...nodes.filter(x => x.id !== this.defaultApiConfiguration?.id)]);
      }
      this.apiPageInfo = res.data.apiConfigurations.pageInfo;
      this.apiConfigurationsLoading = res.loading;
      this.loading = false && this.formsLoading;
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

  /**
   * Get fields from form id.
   * @param id Id of selected form.
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

 /**
  * Filters fields so we cannot add a multiple mapping for the same one.
  * @param name Field name.
  * @returns Filtered fields.
  */
  public filteredFields(name: string): any[] {
    return this.fields.filter(field => field.name === name || !this.pullJobForm.value.mapping.some((x: any) => x.name === field.name));
  }

 /**
  * Removes element from the mapping
  * @param index mapping element index.
  */
  onDeleteElement(index: number): void {
    this.mappingArray.removeAt(index);
  }

 /**
  * Adds new element to the mapping.
  */
  onAddElement(): void {
    this.mappingArray.push(this.formBuilder.group({
      name: ['', Validators.required],
      value: ['', Validators.required]
    }));
  }

 /**
  * Toggles the edit mode and update form values accordingly.
  */
  toggleRawJSON(): void {
    if (this.openRawJSON) {
      const mapping = JSON.parse(this.pullJobForm.get('rawMapping')?.value || '');
      this.pullJobForm.setControl('mapping', this.formBuilder.array(Object.keys(mapping).map((x: any) => this.formBuilder.group({
        name: [x, Validators.required],
        value: [mapping[x], Validators.required],
      }))));
    } else {
      const mapping = this.pullJobForm.get('mapping')?.value.reduce((o: any, field: any) => {
        return { ...o, [field.name]: field.value };
      }, {});
      this.pullJobForm.get('rawMapping')?.setValue(JSON.stringify(mapping, null, 2));
    }
    this.openRawJSON = !this.openRawJSON;
  }

 /**
  * Closes the modal without sending any data.
  */
  onClose(): void {
    this.dialogRef.close();
  }

 /**
  * Synchronizes mapping values on update button click.
  * @returns Return form value.
  */
  returnFormValue(): any {
    if (!this.openRawJSON) {
      const mapping = this.pullJobForm.get('mapping')?.value.reduce((o: any, field: any) => {
        return { ...o, [field.name]: field.value };
      }, {});
      this.pullJobForm.get('rawMapping')?.setValue(JSON.stringify(mapping, null, 2));
    }
    return this.pullJobForm.value;
  }

  /**
   * Adds scroll listener to select.
   * @param e open select event.
   */
  onOpenFormsSelect(e: any): void {
    if (e && this.formSelect) {
      const panel = this.formSelect.panel.nativeElement;
      panel.addEventListener('scroll', (event: any) => this.loadFormsOnScroll(event));
    }
  }

  /**
   * Fetches more forms on scroll.
   * @param e scroll event.
   */
  private loadFormsOnScroll(e: any): void {
    if (e.target.scrollHeight - (e.target.clientHeight + e.target.scrollTop) < 50) {
      if (!this.formsLoading && this.formsPageInfo.hasNextPage) {
        this.formsLoading = true;
        this.formsQuery.fetchMore({
          variables: {
            first: ITEMS_PER_PAGE,
            afterCursor: this.formsPageInfo.endCursor
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) { return prev; }
            return Object.assign({}, prev, {
              forms: {
                edges: [...prev.forms.edges, ...fetchMoreResult.forms.edges],
                pageInfo: fetchMoreResult.forms.pageInfo,
                totalCount: fetchMoreResult.forms.totalCount
              }
            });
          }
        });
      }
    }
  }

  /**
   * Adds scroll listener to select.
   * @param e open select event.
   */
   onOpenApiSelect(e: any): void {
    if (e && this.apiSelect) {
      const panel = this.apiSelect.panel.nativeElement;
      panel.addEventListener('scroll', (event: any) => this.loadApiOnScroll(event));
    }
  }

  /**
   * Fetches more API configurations on scroll.
   * @param e scroll event.
   */
  private loadApiOnScroll(e: any): void {
    if (e.target.scrollHeight - (e.target.clientHeight + e.target.scrollTop) < 50) {
      if (!this.apiConfigurationsLoading && this.apiPageInfo.hasNextPage) {
        this.apiConfigurationsLoading = true;
        this.apiConfigurationsQuery.fetchMore({
          variables: {
            first: ITEMS_PER_PAGE,
            afterCursor: this.apiPageInfo.endCursor
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) { return prev; }
            return Object.assign({}, prev, {
              apiConfigurations: {
                edges: [...prev.apiConfigurations.edges, ...fetchMoreResult.apiConfigurations.edges],
                pageInfo: fetchMoreResult.apiConfigurations.pageInfo,
                totalCount: fetchMoreResult.apiConfigurations.totalCount
              }
            });
          }
        });
      }
    }
  }
}
