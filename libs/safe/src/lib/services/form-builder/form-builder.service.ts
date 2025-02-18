import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as Survey from 'survey-angular';
import { SafeReferenceDataService } from '../reference-data/reference-data.service';
import { renderGlobalProperties } from '../../survey/render-global-properties';
import { Apollo } from 'apollo-angular';
import get from 'lodash/get';
import { Record } from '../../models/record.model';
import { EditRecordMutationResponse, EDIT_RECORD } from './graphql/mutations';
import { Metadata } from '../../models/metadata.model';
import { SafeRestService } from '../rest/rest.service';
import { BehaviorSubject } from 'rxjs';
import { SnackbarService } from '@oort-front/ui';

/**
 * Shared form builder service.
 * Only used to add on complete expression to the survey.
 */
@Injectable({
  providedIn: 'root',
})
export class SafeFormBuilderService {
  /**
   * Constructor of the service
   *
   * @param referenceDataService Reference data service
   * @param translate Translation service
   * @param apollo Apollo service
   * @param snackBar Service used to show a snackbar.
   * @param restService This is the service that is used to make http requests.
   */
  constructor(
    private referenceDataService: SafeReferenceDataService,
    private translate: TranslateService,
    private apollo: Apollo,
    private snackBar: SnackbarService,
    private restService: SafeRestService
  ) {}

  /**
   * Creates new survey from the structure and add on complete expression to it.
   *
   * @param structure form structure
   * @param pages Pages of the current survey
   * @param fields list of fields used to check if the fields should be hidden or disabled
   * @param record record that'll be edited, if any
   * @returns New survey
   */
  createSurvey(
    structure: string,
    pages: BehaviorSubject<any[]>,
    fields: Metadata[] = [],
    record?: Record
  ): Survey.SurveyModel {
    Survey.settings.useCachingForChoicesRestful = false;
    Survey.settings.useCachingForChoicesRestfull = false;
    const survey = new Survey.Model(structure);
    survey.onAfterRenderQuestion.add(
      renderGlobalProperties(this.referenceDataService)
    );
    survey.onCompleting.add(() => {
      for (const page of survey.toJSON().pages) {
        if (!page.elements) continue;
        for (const element of page.elements) {
          if (element.type === 'resources' || element.type === 'resource') {
            // if its a single record, the value will be string
            // so we account for that by putting it in an array
            const valueIterator =
              (element.type === 'resources'
                ? survey.getValue(element.name)
                : [survey.getValue(element.name)]) || [];

            const regex = /{\s*(\b.*\b)\s*}\s*=\s*"(.*)"/g;
            for (const item of valueIterator) {
              let operation: any;
              if (
                element.newCreatedRecords &&
                element.newCreatedRecords.includes(item) &&
                element.afterRecordCreation
              ) {
                regex.lastIndex = 0; // ensure that regex restarts
                operation = regex.exec(element.afterRecordCreation); // divide string into groups for key : value mapping
              } else if (element.afterRecordSelection) {
                regex.lastIndex = 0; // ensure that regex restarts
                const isNewlySelected =
                  element.type === 'resources'
                    ? !get(record, `data.${element.name}`, []).includes(item)
                    : !(get(record, `data.${element.name}`, null) === item);
                // only updates those records that were not in the old value for the field
                if (isNewlySelected)
                  operation = regex.exec(element.afterRecordSelection); // divide string into groups for key : value mapping
              }
              this.updateRecord(item, operation);
            }
          }
        }
      }
    });
    if (fields.length > 0) {
      for (const f of fields.filter((x) => !x.automated)) {
        const accessible = !!f.canSee;
        const editable = !!f.canUpdate;
        const disabled: boolean =
          (f.canUpdate !== undefined && !f.canUpdate) || false;
        const question = survey.getQuestionByName(f.name);
        if (question) {
          //If is not accessible for the current user, we will delete the question from the current survey instance
          if (!accessible) {
            question.delete();
          } else {
            question.readOnly = disabled || !editable;
          }
        }
      }
    }
    // set the lang of the survey
    const surveyLang = localStorage.getItem('surveyLang');
    if (surveyLang && survey.getUsedLocales().includes(surveyLang)) {
      survey.locale = surveyLang;
    } else {
      const lang = this.translate.currentLang || this.translate.defaultLang;
      if (survey.getUsedLocales().includes(lang)) {
        survey.locale = lang;
      }
    }
    survey.showNavigationButtons = 'none';
    survey.showProgressBar = 'off';
    survey.focusFirstQuestionAutomatic = false;
    this.setPages(survey, pages);
    return survey;
  }

  /**
   * Add common events callbacks to the created survey taking in account pages
   * and temporary files storage
   *
   * @param survey Survey where to add the callbacks
   * @param pages Pages of the current survey
   * @param selectedPageIndex Current page of the survey
   * @param temporaryFilesStorage Temporary files saved while executing the survey
   */
  public addEventsCallBacksToSurvey(
    survey: Survey.SurveyModel,
    pages: BehaviorSubject<any[]>,
    selectedPageIndex: BehaviorSubject<number>,
    temporaryFilesStorage: any
  ) {
    survey.onClearFiles.add((_, options: any) => this.onClearFiles(options));
    survey.onUploadFiles.add((_, options: any) =>
      this.onUploadFiles(temporaryFilesStorage, options)
    );
    survey.onDownloadFile.add((_, options: any) =>
      this.onDownloadFile(options)
    );
    survey.onUpdateQuestionCssClasses.add((_, options: any) =>
      this.onSetCustomCss(options)
    );
    survey.onPageVisibleChanged.add(() => {
      this.setPages(survey, pages);
    });
    survey.onSettingQuestionErrors.add(() => {
      this.setPages(survey, pages);
    });
    survey.onCurrentPageChanged.add((survey: Survey.SurveyModel) => {
      survey.checkErrorsMode = survey.isLastPage ? 'onComplete' : 'onNextPage';
      selectedPageIndex.next(survey.currentPageNo);
    });
  }

  /**
   * Set the pages of the survey
   *
   * @param survey Current survey
   * @param pages Page number emitter
   */
  private setPages(
    survey: Survey.SurveyModel,
    pages: BehaviorSubject<any[]>
  ): void {
    const pageList = [];
    if (survey) {
      for (const page of survey.pages) {
        if (page.isVisible) {
          pageList.push(page);
        }
      }
    }
    pages.next(pageList);
  }

  /**
   * Handles the clearing of files
   *
   * @param options Options regarding the files
   */
  private onClearFiles(options: any): void {
    options.callback('success');
  }

  /**
   * Handles the uploading of files event
   *
   * @param temporaryFilesStorage Temporary files saved while executing the survey
   * @param options Options regarding the upload
   */
  private onUploadFiles(temporaryFilesStorage: any, options: any): void {
    if (temporaryFilesStorage[options.name] !== undefined) {
      temporaryFilesStorage[options.name].concat(options.files);
    } else {
      temporaryFilesStorage[options.name] = options.files;
    }
    let content: any[] = [];
    options.files.forEach((file: any) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        content = content.concat([
          {
            name: file.name,
            type: file.type,
            content: fileReader.result,
            file,
          },
        ]);
        if (content.length === options.files.length) {
          options.callback(
            'success',
            content.map((fileContent) => ({
              file: fileContent.file,
              content: fileContent.content,
            }))
          );
        }
      };
      fileReader.readAsDataURL(file);
    });
  }

  /**
   * Handles the downloading of a file event
   *
   * @param options Options regarding the download
   */
  private onDownloadFile(options: any): void {
    if (
      options.content.indexOf('base64') !== -1 ||
      options.content.indexOf('http') !== -1
    ) {
      options.callback('success', options.content);
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open(
        'GET',
        `${this.restService.apiUrl}/download/file/${options.content}`
      );
      xhr.setRequestHeader(
        'Authorization',
        `Bearer ${localStorage.getItem('idtoken')}`
      );
      xhr.onloadstart = () => {
        xhr.responseType = 'blob';
      };
      xhr.onload = () => {
        const file = new File([xhr.response], options.fileValue.name, {
          type: options.fileValue.type,
        });
        const reader = new FileReader();
        reader.onload = (e) => {
          options.callback('success', e.target?.result);
        };
        reader.readAsDataURL(file);
      };
      xhr.send();
    }
  }

  /**
   * Add custom CSS classes to the survey elements.
   *
   * @param options survey options.
   */
  private onSetCustomCss(options: any): void {
    const classes = options.cssClasses;
    classes.content += 'safe-qst-content';
  }

  /**
   * Updates the field with the specified information.
   *
   * @param id Id of the record to update
   * @param operation Operation to execute
   */
  private updateRecord(id: string, operation: any): void {
    if (id && operation) {
      this.apollo
        .mutate<EditRecordMutationResponse>({
          mutation: EDIT_RECORD,
          variables: {
            id,
            data: { [operation[1]]: operation[2] },
          },
        })
        .subscribe({
          next: ({ errors }) => {
            if (errors) {
              this.snackBar.openSnackBar(
                this.translate.instant(
                  'common.notifications.objectNotUpdated',
                  {
                    type: this.translate.instant('common.record.one'),
                    error: errors ? errors[0].message : '',
                  }
                ),
                { error: true }
              );
            } else {
              this.snackBar.openSnackBar(
                this.translate.instant('common.notifications.objectUpdated', {
                  type: this.translate.instant('common.record.one'),
                  value: '',
                })
              );
            }
          },
        });
    }
  }
}
