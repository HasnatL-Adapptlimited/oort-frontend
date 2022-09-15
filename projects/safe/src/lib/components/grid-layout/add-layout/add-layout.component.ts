import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { SafeGridLayoutService } from '../../../services/grid-layout.service';
import { Form } from '../../../models/form.model';
import { Layout } from '../../../models/layout.model';
import { Resource } from '../../../models/resource.model';
import { SafeLayoutModalComponent } from '../layout-modal/layout-modal.component';
import { Apollo, QueryRef } from 'apollo-angular';
import {
  GetResourceLayoutsResponse,
  GET_RESOURCE_LAYOUTS,
  GetFormLayoutsResponse,
  GET_FORM_LAYOUTS,
} from './graphql/queries';
import { FormControl } from '@angular/forms';

/**
 * Data needed for the dialog, should contain a layouts array, a form and a resource
 */
interface DialogData {
  hasLayouts: boolean;
  form?: Form;
  resource?: Resource;
}

/**
 * Add a layout modal.
 * Modal is then added to the grid, and to the related form / resource if new.
 */
@Component({
  selector: 'safe-add-layout',
  templateUrl: './add-layout.component.html',
  styleUrls: ['./add-layout.component.scss'],
})
export class AddLayoutComponent implements OnInit {
  private form?: Form;
  public resource?: Resource;
  public hasLayouts = false;
  public nextStep = false;
  public queryRef!:
    | QueryRef<GetResourceLayoutsResponse>
    | QueryRef<GetFormLayoutsResponse>
    | null;
  public selectedLayoutControl = new FormControl('');

  /**
   * Add layout modal component.
   *
   * @param dialogRef Material dialog reference
   * @param dialog Material dialog instance
   * @param data Data used by the modal
   * @param gridLayoutService Grid layout service
   * @param apollo Apollo service
   */
  constructor(
    private dialogRef: MatDialogRef<AddLayoutComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private gridLayoutService: SafeGridLayoutService,
    private apollo: Apollo
  ) {
    this.hasLayouts = data.hasLayouts;
    this.form = data.form;
    this.resource = data.resource;
  }

  ngOnInit() {
    if (this.resource)
      this.queryRef = this.apollo.watchQuery<GetResourceLayoutsResponse>({
        query: GET_RESOURCE_LAYOUTS,
        variables: {
          resource: this.resource?.id,
        },
      });
    else if (this.form)
      this.queryRef = this.apollo.watchQuery<GetFormLayoutsResponse>({
        query: GET_FORM_LAYOUTS,
        variables: {
          form: this.form?.id,
        },
      });

    this.selectedLayoutControl.valueChanges.subscribe((value) => {
      this.dialogRef.close(value);
      // if (!this.queryRef || !value) return;
      // const currRes = this.queryRef.getCurrentResult() as any;
      // const queryName = this.resource ? 'resource' : 'form';
      // const addedLayout = currRes.data?.[queryName]?.layouts?.edges.find(
      //   (edge: any) => edge.node.id === value
      // )?.node;

      // if (addedLayout) {
      //   this.layouts.push(addedLayout);
      //   this.dialogRef.close(addedLayout);
      // }
    });
  }

  /**
   * Opens the panel to create a new layout.
   */
  public onCreate(): void {
    const dialogRef = this.dialog.open(SafeLayoutModalComponent, {
      disableClose: true,
      data: {
        queryName: this.resource?.queryName || this.form?.queryName,
      },
    });
    dialogRef.afterClosed().subscribe((layout) => {
      if (layout) {
        this.gridLayoutService
          .addLayout(layout, this.resource?.id, this.form?.id)
          .subscribe((res) => {
            if (res.data?.addLayout) {
              this.dialogRef.close(res.data.addLayout);
            } else {
              this.dialogRef.close();
            }
          });
      }
    });
  }
}
