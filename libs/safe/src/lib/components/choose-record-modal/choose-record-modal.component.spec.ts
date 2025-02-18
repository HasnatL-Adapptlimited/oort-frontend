import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import {
  DialogModule as DialogCdkModule,
  DialogRef,
  DIALOG_DATA,
} from '@angular/cdk/dialog';
import { QueryBuilderService } from '../../services/query-builder/query-builder.service';
import { SafeChooseRecordModalComponent } from './choose-record-modal.component';
import {
  ApolloTestingModule,
  ApolloTestingController,
} from 'apollo-angular/testing';
import { GET_QUERY_TYPES } from './graphql/queries';

describe('SafeChooseRecordModalComponent', () => {
  let component: SafeChooseRecordModalComponent;
  let fixture: ComponentFixture<SafeChooseRecordModalComponent>;
  let controller: ApolloTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        QueryBuilderService,
        UntypedFormBuilder,
        { provide: DialogRef, useValue: {} },
        { provide: DIALOG_DATA, useValue: {} },
      ],
      declarations: [SafeChooseRecordModalComponent],
      imports: [DialogCdkModule, ApolloTestingModule],
    }).compileComponents();

    controller = TestBed.inject(ApolloTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SafeChooseRecordModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const op1 = controller.expectOne(GET_QUERY_TYPES);

    op1.flush({
      data: {
        __schema: {
          types: [],
        },
        fields: [],
      },
    });

    const op2 = controller.expectOne('GetCustomQuery');

    op2.flush({
      data: {},
    });
  });

  afterEach(() => {
    controller.verify();
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
