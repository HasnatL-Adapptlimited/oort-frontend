import { Component, OnInit, ViewChild } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { Subject, takeUntil } from 'rxjs';
import { SafeUnsubscribeComponent } from '../../components/utils/unsubscribe/unsubscribe.component';
import { PositionAttributeCategory } from '../../models/position-attribute-category.model';
import { Role } from '../../models/user.model';
import { SafeApplicationService } from '../../services/application/application.service';
import { UserListComponent } from './components/user-list/user-list.component';
import { AddUsersMutationResponse, ADD_USERS } from './graphql/mutations';
import { SnackbarService } from '@oort-front/ui';

/**
 * Application users component.
 */
@Component({
  selector: 'safe-application-users',
  templateUrl: './application-users.component.html',
  styleUrls: ['./application-users.component.scss'],
})
export class SafeApplicationUsersComponent
  extends SafeUnsubscribeComponent
  implements OnInit
{
  public roles: Role[] = [];
  public positionAttributeCategories: PositionAttributeCategory[] = [];
  refetch$: Subject<boolean> = new Subject<boolean>();
  @ViewChild(UserListComponent) userList?: UserListComponent;

  /**
   * Application users component.
   *
   * @param dialog Dialog
   * @param applicationService Shared application service
   * @param apollo Apollo service
   * @param translate Translate service
   * @param snackBar Shared snackbar service
   */
  constructor(
    private dialog: Dialog,
    private applicationService: SafeApplicationService,
    private apollo: Apollo,
    private translate: TranslateService,
    private snackBar: SnackbarService
  ) {
    super();
  }

  ngOnInit(): void {
    this.applicationService.application$
      .pipe(takeUntil(this.destroy$))
      .subscribe((application) => {
        if (application) {
          this.roles = application.roles || [];
          this.positionAttributeCategories =
            application.positionAttributeCategories || [];
        }
      });
  }

  /**
   * Show a dialog for inviting someone
   */
  async onInvite(): Promise<void> {
    const { SafeInviteUsersComponent } = await import(
      '../../components/users/components/invite-users/invite-users.component'
    );
    const dialogRef = this.dialog.open(SafeInviteUsersComponent, {
      data: {
        roles: this.roles,
        users: [],
        downloadPath: this.applicationService
          ? this.applicationService.usersDownloadPath
          : 'download/invite',
        uploadPath: this.applicationService
          ? this.applicationService.usersUploadPath
          : 'upload/invite',
        ...(this.positionAttributeCategories && {
          positionAttributeCategories: this.positionAttributeCategories,
        }),
      },
    });
    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
      if (value) {
        this.apollo
          .mutate<AddUsersMutationResponse>({
            mutation: ADD_USERS,
            variables: {
              users: value,
              application: this.roles[0].application?.id,
            },
          })
          .subscribe(({ errors, data }) => {
            if (!errors) {
              if (data?.addUsers.length) {
                this.snackBar.openSnackBar(
                  this.translate.instant('components.users.onInvite.plural')
                );
              } else {
                this.snackBar.openSnackBar(
                  this.translate.instant('components.users.onInvite.singular')
                );
              }
              this.userList?.fetchUsers(true);
            } else {
              if (data?.addUsers?.length) {
                this.snackBar.openSnackBar(
                  this.translate.instant(
                    'components.users.onNotInvite.plural',
                    { error: errors[0].message }
                  ),
                  { error: true }
                );
              } else {
                this.snackBar.openSnackBar(
                  this.translate.instant(
                    'components.users.onNotInvite.singular',
                    { error: errors[0].message }
                  ),
                  { error: true }
                );
              }
            }
          });
      }
    });
  }

  /**
   * Export the list of users
   *
   * @param type The type of file we want ('csv' or 'xlsx')
   */
  onExport(type: 'csv' | 'xlsx'): void {
    this.applicationService.downloadUsers(
      type,
      this.userList?.selection.selected
        .map((x) => x.id || '')
        .filter((x) => x !== '') || []
    );
  }
}
