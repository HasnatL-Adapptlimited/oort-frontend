import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  DialogModule as DialogCdkModule,
  DialogRef,
  DIALOG_DATA,
} from '@angular/cdk/dialog';
import { SafeConfirmModalComponent } from './confirm-modal.component';
import {
  ApolloTestingModule,
  ApolloTestingController,
} from 'apollo-angular/testing';
import {
  TranslateModule,
  TranslateService,
  TranslateFakeLoader,
  TranslateLoader,
} from '@ngx-translate/core';

describe('SafeConfirmModalComponent', () => {
  let component: SafeConfirmModalComponent;
  let fixture: ComponentFixture<SafeConfirmModalComponent>;
  let controller: ApolloTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        TranslateService,
        { provide: DialogRef, useValue: {} },
        { provide: DIALOG_DATA, useValue: {} },
      ],
      declarations: [SafeConfirmModalComponent],
      imports: [
        DialogCdkModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader,
          },
        }),
        ApolloTestingModule,
      ],
    }).compileComponents();

    controller = TestBed.inject(ApolloTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SafeConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    controller.verify();
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
