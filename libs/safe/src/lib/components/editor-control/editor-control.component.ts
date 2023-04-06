import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import {
  MatLegacyFormField as MatFormField,
  MatLegacyFormFieldControl as MatFormFieldControl,
  MAT_LEGACY_FORM_FIELD as MAT_FORM_FIELD,
} from '@angular/material/legacy-form-field';
import { Subject } from 'rxjs';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  EditorComponent,
  EditorModule,
  TINYMCE_SCRIPT_SRC,
} from '@tinymce/tinymce-angular';
import { SafeEditorService } from '../../services/editor/editor.service';
import { RawEditorSettings } from 'tinymce';

/** Component for using TinyMCE editor with formControl */
@Component({
  selector: 'safe-editor-control',
  standalone: true,
  imports: [CommonModule, EditorModule, FormsModule],
  templateUrl: './editor-control.component.html',
  styleUrls: ['./editor-control.component.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: SafeEditorControlComponent,
    },
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
  ],
})
export class SafeEditorControlComponent
  implements
    ControlValueAccessor,
    MatFormFieldControl<string | null>,
    OnDestroy,
    AfterViewInit,
    OnChanges
{
  static nextId = 0;

  @ViewChild('editor') editor!: EditorComponent;
  public editorContent = '';

  /** tinymce editor */
  @Input() editorConfig!: RawEditorSettings;

  /**
   * Gets the value
   *
   * @returns the value
   */
  @Input() get value(): string | null {
    return this.ngControl.value;
  }

  /** Sets the value */
  set value(val: string | null) {
    this.onChange(val);
    this.stateChanges.next();
  }

  public stateChanges = new Subject<void>();
  @HostBinding()
  id = `safe-editor-control-${SafeEditorControlComponent.nextId++}`;

  /**
   * Gets the placeholder for the select
   *
   * @returns the placeholder
   */
  @Input() get placeholder() {
    return this.ePlaceholder;
  }

  /**
   * Sets the placeholder
   */
  set placeholder(plh) {
    this.ePlaceholder = plh;
    this.stateChanges.next();
  }
  private ePlaceholder = '';
  public focused = false;
  public touched = false;

  /**
   * Gets the empty status
   *
   * @returns if an option is selected
   */
  get empty() {
    return !this.ngControl.control?.value;
  }

  /**
   * Indicates whether the label should be in the floating position
   *
   * @returns whether the label should be in the floating position
   */
  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  /**
   * Indicates whether the field is required
   *
   * @returns whether the field is required
   */
  @Input()
  get required() {
    return this.isRequired;
  }

  /**
   * Sets whether the field is required
   */
  set required(req) {
    this.isRequired = coerceBooleanProperty(req);
    this.stateChanges.next();
  }
  private isRequired = false;

  /**
   * Indicates whether the field is disabled
   *
   * @returns whether the field is disabled
   */
  @Input()
  get disabled(): boolean {
    return this.ngControl.disabled || false;
  }

  /** Sets whether the field is disabled */
  set disabled(value: boolean) {
    const isDisabled = coerceBooleanProperty(value);
    if (isDisabled) this.ngControl.control?.disable();
    else this.ngControl.control?.enable();
    this.stateChanges.next();
  }

  /**
   * Indicates whether the input is in an error state
   *
   * @returns whether the input is in an error state
   */
  get errorState(): boolean {
    return (this.ngControl.invalid && this.touched) || false;
  }

  public controlType = 'safe-editor-control';

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('aria-describedby') userAriaDescribedBy!: string;

  /**
   * Component for using TinyMCE editor with formControl
   *
   * @param editorService editor service
   * @param elementRef shared element ref service
   * @param formField MatFormField
   * @param ngControl form control shared service
   */
  constructor(
    private editorService: SafeEditorService,
    private elementRef: ElementRef<HTMLElement>,
    @Optional() @Inject(MAT_FORM_FIELD) public formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnChanges(): void {
    // Set the editor base url based on the environment file
    this.editorConfig.base_url = this.editorService.url;

    // Set the editor language
    this.editorConfig.language = this.editorService.language;
    this.editorContent = this.value || '';
  }

  ngAfterViewInit(): void {
    this.editor.onFocusIn.subscribe(() => {
      this.onFocusIn();
    });

    this.editor.onFocusOut.subscribe((e) => {
      this.onFocusOut(e.event);
    });
    // this.editor.onInit.subscribe(() => {});
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched = () => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  onChange = (_: any) => {};

  /**
   * Sets element ids that should be used for the aria-describedby attribute of your control
   *
   * @param ids id array
   */
  setDescribedByIds(ids: string[]) {
    const controlElement = this.elementRef.nativeElement.querySelector(
      '.safe-editor-control'
    );
    if (!controlElement) return;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }

  /**
   * Handles mouse click on container
   */
  onContainerClick() {
    if (this.editor) this.editor.editor.focus();
  }

  /**
   * Gets the value from the parent form control
   *
   * @param val Value set from the linked form control
   */
  writeValue(val: string | null): void {
    this.value = val;
  }

  /**
   * Register the change function from the parent form to use it
   *
   * @param fn onChange function from the parent form
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Register the touch function from the parent form to use it
   *
   * @param fn onTouched function from the parent form
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Handles focus on input
   */
  onFocusIn() {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  /**
   * Handles lost focus on input
   *
   * @param event The focus event
   */
  onFocusOut(event: FocusEvent) {
    if (
      this.focused &&
      !this.elementRef.nativeElement.contains(event.relatedTarget as Element)
    ) {
      this.touched = true;
      this.focused = false;
      this.onTouched();
      this.stateChanges.next();
    }
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
  }

  /** Updates the value when the editor content changes */
  public onEditorContentChange() {
    this.onTouched();
    const rawHtml = this.editor.editor.getContent();
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(rawHtml, 'text/html');
    this.value = parsedHtml.body.textContent;
    // remove the first 3 and last 4 characters to remove the <p> tags
    // this.value = this.editor.editor.getContent();
  }
}
