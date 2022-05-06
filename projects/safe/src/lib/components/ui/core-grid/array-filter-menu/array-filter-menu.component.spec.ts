import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { SafeArrayFilterMenuComponent } from './array-filter-menu.component';

describe('SafeArrayFilterMenuComponent', () => {
  let component: SafeArrayFilterMenuComponent;
  let fixture: ComponentFixture<SafeArrayFilterMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        FormBuilder
      ],
      declarations: [SafeArrayFilterMenuComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SafeArrayFilterMenuComponent);
    component = fixture.componentInstance;
    component.filter = {
      logic: null,
      filters: []
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
