import { Component, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { CronExpressionControlModalComponent } from './cron-expression-control-modal/cron-expression-control-modal.component';

/**
 * Cron expression form control
 */
@Component({
  selector: 'safe-cron-expression-control',
  templateUrl: './cron-expression-control.component.html',
  styleUrls: ['./cron-expression-control.component.scss'],
  // providers: [CONTROL_VALUE_ACCESSOR],
})
export class CronExpressionControlComponent implements ControlValueAccessor {
  // /** @returns the value */
  // get value(): string | undefined | null {
  //   return this.ngControl.value;
  // }

  // /** Sets the value */
  // set value(value: string | undefined | null) {
  //   this.ngControl.control?.setValue(value);
  // }
  public value: string | undefined | null;

  private onTouched!: any;
  private onChanged!: any;
  public disabled = false;

  /**
   *  Cron expression form control
   *
   * @param ngControl Angular form control base class
   * @param dialog Material dialog service
   */
  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private dialog: MatDialog
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  /**
   * Write new value
   *
   * @param value cron expression
   */
  writeValue(value: any): void {
    this.value = value;
  }

  /**
   * Register change of the control
   *
   * @param fn callback
   */
  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }

  /**
   * Register touch event
   *
   * @param fn callback
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Set disabled state
   *
   * @param isDisabled is control disabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Opens the cron expression component modal */
  public onEdit(): void {
    const dialogRef = this.dialog.open(CronExpressionControlModalComponent, {
      autoFocus: false,
      data: {
        value: this.value,
      },
    });
    dialogRef.afterClosed().subscribe((value: string | undefined | null) => {
      if (value) {
        this.writeValue(value);
        this.onChanged(value);
      }
    });
  }
}
