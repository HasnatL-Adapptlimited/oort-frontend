import { Injectable } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { SafeConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

/** Interface of confirm dialog data */
interface ConfirmDialogData {
  title?: string;
  content?: string;
  confirmText?: string;
  confirmColor?: string;
}

/**
 * Confirmation modal service.
 */
@Injectable({
  providedIn: 'root',
})
export class SafeConfirmService {
  /**
   * Confirmation modal service
   *
   * @param dialog Material dialog
   */
  constructor(private dialog: MatDialog) {}

  /**
   * Open confirmation modal.
   *
   * @param data dialog data
   * @param dialog Material dialog (required for components displayed in modals, as it could show confirmation modal below other modal otherwise)
   * @returns confirmation modal dialog ref
   */
  openConfirmModal(
    data?: ConfirmDialogData,
    dialog?: MatDialog
  ): MatDialogRef<SafeConfirmModalComponent> {
    if (dialog) {
      return dialog.open(SafeConfirmModalComponent, { data });
    } else {
      return this.dialog.open(SafeConfirmModalComponent, { data });
    }
  }
}
