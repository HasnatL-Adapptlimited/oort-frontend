import { Component, OnInit, Inject } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { SafeDateTranslateService } from '../../services/date-translate/date-translate.service';
import { getLanguageNativeName } from '../../utils/languages';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  TabsModule,
  DialogModule,
  ButtonModule,
  TooltipModule,
  SelectMenuModule,
  FormWrapperModule,
  IconModule,
} from '@oort-front/ui';
import { DIALOG_DATA } from '@angular/cdk/dialog';

/** Preferences Dialog Data */
interface PreferencesDialogData {
  languages: string[];
}

/**
 * Preferences Modal.
 */
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabsModule,
    DialogModule,
    IconModule,
    ButtonModule,
    TooltipModule,
    SelectMenuModule,
    FormWrapperModule,
  ],
  selector: 'safe-preferences-modal',
  templateUrl: './preferences-modal.component.html',
  styleUrls: ['./preferences-modal.component.scss'],
})
export class SafePreferencesModalComponent implements OnInit {
  // === REACTIVE FORM ===
  public preferencesForm: UntypedFormGroup = new UntypedFormGroup({});

  // === DATA ===
  languages: { name: string; value: string }[] = [];
  currLang: string;
  dateFormats: { name: string | null; value: string }[] = [];
  currDateFormat: string;

  /**
   * Preferences Modal constructor
   *
   * @param data Data that will be passed to the modal
   * @param formBuilder This is the service that will be used to build forms.
   * @param translate This is the Angular service that translates text
   * @param dateTranslate Shared service for Date Translation
   */
  constructor(
    @Inject(DIALOG_DATA) public data: PreferencesDialogData,
    private formBuilder: UntypedFormBuilder,
    private translate: TranslateService,
    private dateTranslate: SafeDateTranslateService
  ) {
    // find the current language
    this.currLang = this.translate.currentLang || this.translate.defaultLang;
    // find the list of languages and their complete names
    this.languages = data.languages.map((code: string) => ({
      value: code,
      name: getLanguageNativeName(code),
    }));

    // find the current date language
    this.currDateFormat = this.dateTranslate.currentLang;
    // find the list of languages with their example date formats
    this.dateFormats = data.languages
      .map((code: string) => ({
        value: code,
        name: this.getDateFormatText(code),
      }))
      .filter((dateLang) => dateLang.name);
  }

  ngOnInit(): void {
    // this.getLocalizedLangNames();
    this.preferencesForm = this.formBuilder.group({
      // initializes select field with current language
      language: [this.currLang, Validators.required],
      // initializes select field with current date language format
      dateFormat: [this.currDateFormat, Validators.required],
    });
    this.preferencesForm
      .get('language')
      ?.valueChanges.subscribe((lang: any) => {
        this.translate.use(lang);
      });
  }

  /**
   * Get an example short date in a certain language format
   *
   * @param lang The language in which we want the date
   * @returns The date formated as a string
   */
  private getDateFormatText(lang: string): string | null {
    const date = new Date(1984, 0, 24, 8, 34);
    try {
      const datePipe = new DatePipe(lang);
      return `(${lang.toUpperCase()}) ${datePipe.transform(date, 'short')}`;
    } catch {
      return null;
    }
  }
}
