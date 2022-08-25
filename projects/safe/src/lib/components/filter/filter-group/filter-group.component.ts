import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'safe-filter-group',
  templateUrl: './filter-group.component.html',
  styleUrls: ['./filter-group.component.scss'],
})
export class FilterGroupComponent implements OnInit {
  @Input() form!: FormGroup;
  @Output() delete = new EventEmitter();

  /**
   * Getter for the filters
   *
   * @returns The filters in an array
   */
  get filters(): FormArray {
    return this.form.get('filters') as FormArray;
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {}

  deleteFilter(index: number): void {
    this.filters.removeAt(index);
  }

  addFilter(): void {
    console.log(this.filters);
    const filter = this.fb.group({
      field: '',
      operator: 'eq',
      value: null,
    });
    this.filters.push(filter);
  }

  addGroup(): void {
    const filter = this.fb.group({
      logic: 'and',
      filters: this.fb.array([]),
    });
    this.filters.push(filter);
  }
}
