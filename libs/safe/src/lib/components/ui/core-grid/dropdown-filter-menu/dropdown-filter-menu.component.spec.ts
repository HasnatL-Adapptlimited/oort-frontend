import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';

import { SafeDropdownFilterMenuComponent } from './dropdown-filter-menu.component';

describe('SafeDropdownFilterMenuComponent', () => {
  let component: SafeDropdownFilterMenuComponent;
  let fixture: ComponentFixture<SafeDropdownFilterMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [UntypedFormBuilder],
      declarations: [SafeDropdownFilterMenuComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SafeDropdownFilterMenuComponent);
    component = fixture.componentInstance;
    component.filter = {
      logic: [],
      filters: [],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
