import { Apollo } from 'apollo-angular';
import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import {
  GetRecordDetailsQueryResponse,
  GET_RECORD_DETAILS,
} from './graphql/queries';
import { Form } from '../../models/form.model';
import { SafeUnsubscribeComponent } from '../utils/unsubscribe/unsubscribe.component';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerModule } from '@oort-front/ui';
import { TranslateModule } from '@ngx-translate/core';
import {} from '@oort-front/ui';
import {
  RadioModule,
  ButtonModule,
  SelectMenuModule,
  FormWrapperModule,
  DialogModule,
} from '@oort-front/ui';

/**
 * An interface to define the structure of the data displayed in the modal
 */
interface DialogData {
  title: string;
  record: string;
}

/**
 * This component is used in the grids to display a modal after clicking on the "convert" button.
 * This modal allows the user to configurate the convertion.
 */
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerModule,
    TranslateModule,
    DialogModule,
    ButtonModule,
    RadioModule,
    SelectMenuModule,
    FormWrapperModule,
  ],
  selector: 'safe-convert-modal',
  templateUrl: './convert-modal.component.html',
  styleUrls: ['./convert-modal.component.scss'],
})
export class SafeConvertModalComponent
  extends SafeUnsubscribeComponent
  implements OnInit
{
  // === REACTIVE FORM ===
  convertForm: UntypedFormGroup = new UntypedFormGroup({});

  // === DATA ===
  public form?: Form;
  public availableForms: Form[] = [];
  public ignoredFields: any[] = [];

  // === LOAD DATA ===
  public loading = true;

  /**
   * The constructor function is a special function that is called when a new instance of the class is
   * created.
   *
   * @param formBuilder This is used to create a form.
   * @param apollo This is the Apollo service that we'll use to make the GraphQL mutation.
   * @param dialogRef This is the reference of the dialog that will be opened
   * @param data This is the data that is passed into the modal when it is opened.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private apollo: Apollo,
    public dialogRef: DialogRef<SafeConvertModalComponent>,
    @Inject(DIALOG_DATA) public data: DialogData
  ) {
    super();
  }

  ngOnInit(): void {
    this.apollo
      .query<GetRecordDetailsQueryResponse>({
        query: GET_RECORD_DETAILS,
        variables: {
          id: this.data.record,
        },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ data }) => {
        const record = data.record;
        this.form = record.form;
        this.loading = false;
        this.availableForms =
          this.form?.resource?.forms?.filter((x) => x.id !== this.form?.id) ||
          [];
      });
    this.convertForm = this.formBuilder.group({
      targetForm: [null, Validators.required],
      copyRecord: [true, Validators.required],
    });
    this.convertForm
      .get('targetForm')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((targetForm: Form) => {
        if (targetForm) {
          this.ignoredFields =
            this.form?.fields?.filter(
              (sourceField) =>
                !targetForm?.fields?.some(
                  (targetField) => sourceField.name === targetField.name
                )
            ) || [];
        }
      });
  }

  /**
   * Closes the modal without sending data.
   */
  onClose(): void {
    this.dialogRef.close();
  }
}
