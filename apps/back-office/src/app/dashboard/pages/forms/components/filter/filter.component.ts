import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Filter component of Forms page.
 */
@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {
  @Input() loading = false;
  @Output() filter = new EventEmitter<any>();
  public form!: UntypedFormGroup;
  public search = new UntypedFormControl('');
  public show = false;

  /**
   * Filter component of forms page
   *
   * @param formBuilder Shared form builder service.
   */
  constructor(private formBuilder: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: [''],
      startDate: [null],
      endDate: [null],
      status: [''],
      core: [null],
    });
    this.form.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((value) => {
        this.emitFilter(value);
      });
    // this way we can wait for 0.2s before sending an update
    this.search.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((value) => {
        this.form.controls.name.setValue(value);
      });
  }

  /**
   * Emit the filter value, so the main component can get it.
   *
   * @param value new filter value
   */
  private emitFilter(value: any): void {
    const filters: any[] = [];
    if (value.name) {
      filters.push({ field: 'name', operator: 'contains', value: value.name });
    }
    if (value.status) {
      filters.push({ field: 'status', operator: 'eq', value: value.status });
    }
    if (value.startDate) {
      filters.push({
        field: 'createdAt',
        operator: 'gte',
        value: value.startDate,
      });
    }
    if (value.endDate) {
      filters.push({
        field: 'createdAt',
        operator: 'lte',
        value: value.endDate,
      });
    }
    if (value.core != null) {
      if (value.core) {
        filters.push({ field: 'core', operator: 'eq', value: true });
      } else {
        filters.push({ field: 'core', operator: 'neq', value: true });
      }
    }
    const filter = {
      logic: 'and',
      filters,
    };
    this.filter.emit(filter);
  }

  /**
   * Clears form.
   */
  clear(): void {
    this.form.reset();
    this.search.reset();
  }

  /**
   * Clears date range.
   */
  clearDateFilter(): void {
    this.form.setValue({ ...this.form.value, startDate: null, endDate: null });
  }
}
