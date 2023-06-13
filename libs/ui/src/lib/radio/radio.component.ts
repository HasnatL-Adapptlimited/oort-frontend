import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Variant } from '../types/variant';

/**
 * UI Radio button component
 */
@Component({
  selector: 'ui-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
})
export class RadioComponent {
  @Input() name = '';
  @Input() value: string | boolean = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() checked = false;
  @Input() ariaLabelledby = '';
  @Input() variant: Variant = 'default';

  @Output() radioClick: EventEmitter<boolean> = new EventEmitter();

  /**
   * Getter resolving the variant classes
   *
   * @returns resolved classes
   */
  get getVariant(): string[] {
    const classes = [
      this.variant === 'default'
        ? 'radio-primary'
        : this.variant === 'light'
        ? 'radio-grey'
        : 'radio-' + this.variant,
    ];
    if (this.disabled) {
      classes.push('opacity-70 bg-gray-300 pointer-events-none');
    }
    return classes;
  }

  /**
   * Handles the selection of a radio
   */
  onRadioClick() {
    this.checked = true;
    this.radioClick.emit(this.checked);
  }
}
