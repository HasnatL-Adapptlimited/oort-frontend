import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import {
  SafeCheckboxTreeComponent,
  TreeItemNode,
} from './checkbox-tree.component';

describe('SafeCheckboxTreeComponent', () => {
  let component: SafeCheckboxTreeComponent;
  let fixture: ComponentFixture<SafeCheckboxTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SafeCheckboxTreeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SafeCheckboxTreeComponent);
    component = fixture.componentInstance;
    component.checklist = {
      data: [],
      dataChange: new BehaviorSubject<TreeItemNode[]>([]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      initialize: () => {},
      buildFileTree: () => {
        const rst: TreeItemNode[] = [];
        return rst;
      },
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
