import { Apollo, QueryRef } from 'apollo-angular';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  Application,
  PermissionsManagement,
  PermissionType,
  SafeAuthService,
  SafeConfirmModalComponent,
  SafeSnackBarService,
} from '@safe/builder';
import {
  GetApplicationsQueryResponse,
  GET_APPLICATIONS,
} from '../../../graphql/queries';
import {
  DeleteApplicationMutationResponse,
  DELETE_APPLICATION,
  AddApplicationMutationResponse,
  ADD_APPLICATION,
  EditApplicationMutationResponse,
  EDIT_APPLICATION,
} from '../../../graphql/mutations';
import { ChoseRoleComponent } from './components/chose-role/chose-role.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { PreviewService } from '../../../services/preview.service';
import { DuplicateApplicationComponent } from '../../../components/duplicate-application/duplicate-application.component';
import { MatEndDate, MatStartDate } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';

const DEFAULT_PAGE_SIZE = 10;

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
})
export class ApplicationsComponent implements OnInit, AfterViewInit, OnDestroy {
  // === DATA ===
  public loading = true;
  public filterLoading = false;
  private applicationsQuery!: QueryRef<GetApplicationsQueryResponse>;
  private newApplicationsQuery!: QueryRef<GetApplicationsQueryResponse>;
  public applications = new MatTableDataSource<Application>([]);
  public cachedApplications: Application[] = [];
  public displayedColumns = [
    'name',
    'createdAt',
    'status',
    'usersCount',
    'actions',
  ];
  public newApplications: Application[] = [];
  public filter: any;

  // === SORTING ===
  @ViewChild(MatSort) sort?: MatSort;

  public pageInfo = {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
    endCursor: '',
  };

  @ViewChild('startDate', { read: MatStartDate })
  startDate!: MatStartDate<string>;
  @ViewChild('endDate', { read: MatEndDate }) endDate!: MatEndDate<string>;

  // === PERMISSIONS ===
  canAdd = false;
  private authSubscription?: Subscription;

  constructor(
    private apollo: Apollo,
    public dialog: MatDialog,
    private router: Router,
    private snackBar: SafeSnackBarService,
    private authService: SafeAuthService,
    private previewService: PreviewService,
    private translateService: TranslateService
  ) {}

  /**
   * Creates the application query and subscribes to the query changes.
   */
  ngOnInit(): void {
    this.applicationsQuery =
      this.apollo.watchQuery<GetApplicationsQueryResponse>({
        query: GET_APPLICATIONS,
        variables: {
          first: DEFAULT_PAGE_SIZE,
        },
      });
    // new query for card

    this.newApplicationsQuery =
      this.apollo.watchQuery<GetApplicationsQueryResponse>({
        query: GET_APPLICATIONS,
        variables: {
          first: DEFAULT_PAGE_SIZE,
          sortField: 'modifiedAt',
          sortOrder: 'desc',
        },
      });
    this.applicationsQuery.valueChanges.subscribe((res) => {
      this.cachedApplications = res.data.applications.edges.map((x) => x.node);
      this.applications.data = this.cachedApplications.slice(
        this.pageInfo.pageSize * this.pageInfo.pageIndex,
        this.pageInfo.pageSize * (this.pageInfo.pageIndex + 1)
      );
      this.pageInfo.length = res.data.applications.totalCount;
      this.pageInfo.endCursor = res.data.applications.pageInfo.endCursor;
      this.loading = res.loading;
      this.filterLoading = false;
    });
    this.newApplicationsQuery.valueChanges.subscribe((res) => {
      this.newApplications = res.data.applications.edges
        .map((x) => x.node)
        .slice(0, 5);
    });
    this.authSubscription = this.authService.user$.subscribe(() => {
      this.canAdd =
        this.authService.userHasClaim(
          PermissionsManagement.getRightFromPath(
            this.router.url,
            PermissionType.create
          )
        ) ||
        this.authService.userHasClaim(
          PermissionsManagement.getRightFromPath(
            this.router.url,
            PermissionType.manage
          )
        );
    });
  }

  /**
   * Handles page event.
   *
   * @param e page event.
   */
  onPage(e: any): void {
    this.pageInfo.pageIndex = e.pageIndex;
    // Checks if with new page/size more data needs to be fetched
    if (
      (e.pageIndex > e.previousPageIndex ||
        e.pageSize > this.pageInfo.pageSize) &&
      e.length > this.cachedApplications.length
    ) {
      // Sets the new fetch quantity of data needed as the page size
      // If the fetch is for a new page the page size is used
      let first = e.pageSize;
      // If the fetch is for a new page size, the old page size is substracted from the new one
      if (e.pageSize > this.pageInfo.pageSize) {
        first -= this.pageInfo.pageSize;
      }
      this.loading = true;
      this.applicationsQuery.fetchMore({
        variables: {
          first,
          afterCursor: this.pageInfo.endCursor,
          filter: this.filter,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }
          return Object.assign({}, prev, {
            applications: {
              edges: [
                ...prev.applications.edges,
                ...fetchMoreResult.applications.edges,
              ],
              pageInfo: fetchMoreResult.applications.pageInfo,
              totalCount: fetchMoreResult.applications.totalCount,
            },
          });
        },
      });
    } else {
      this.applications.data = this.cachedApplications.slice(
        e.pageSize * this.pageInfo.pageIndex,
        e.pageSize * (this.pageInfo.pageIndex + 1)
      );
    }
    this.pageInfo.pageSize = e.pageSize;
  }

  /**
   * Filters applications and updates table.
   *
   * @param filter filter event.
   */
  onFilter(filter: any): void {
    this.filterLoading = true;
    this.filter = filter;
    this.cachedApplications = [];
    this.pageInfo.pageIndex = 0;
    this.applicationsQuery.fetchMore({
      variables: {
        first: this.pageInfo.pageSize,
        filter: this.filter,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return Object.assign({}, prev, {
          applications: {
            edges: fetchMoreResult.applications.edges,
            pageInfo: fetchMoreResult.applications.pageInfo,
            totalCount: fetchMoreResult.applications.totalCount,
          },
        });
      },
    });
  }

  /**
   * Sets the sort in the view.
   */
  ngAfterViewInit(): void {
    this.applications.sort = this.sort || null;
  }

  /**
   * Removes all subscriptions.
   */
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  /**
   * Deletes an application if authorized.
   *
   * @param element application.
   * @param e click event.
   */
  onDelete(element: any, e?: any): void {
    if (e) {
      e.stopPropagation();
    }
    const dialogRef = this.dialog.open(SafeConfirmModalComponent, {
      data: {
        title: 'Delete application',
        content: `Do you confirm the deletion of the application ${element.name} ?`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });
    dialogRef.afterClosed().subscribe((value) => {
      if (value) {
        const id = element.id;
        this.apollo
          .mutate<DeleteApplicationMutationResponse>({
            mutation: DELETE_APPLICATION,
            variables: {
              id,
            },
          })
          .subscribe((res) => {
            this.snackBar.openSnackBar(
              this.translateService.instant(
                'common.notifications.objectDeleted',
                {
                  value: this.translateService.instant(
                    'common.application.one'
                  ),
                }
              )
            );
            this.applications.data = this.applications.data.filter(
              (x) => x.id !== res.data?.deleteApplication.id
            );
            this.newApplications = this.newApplications.filter(
              (x) => x.id !== res.data?.deleteApplication.id
            );
          });
      }
    });
  }

  /**
   * Displays the AddApplication component.
   * Adds a new application once closed, if result exists.
   */
  onAdd(): void {
    this.apollo
      .mutate<AddApplicationMutationResponse>({
        mutation: ADD_APPLICATION,
      })
      .subscribe((res) => {
        if (res.errors?.length) {
          this.snackBar.openSnackBar(
            this.translateService.instant(
              'common.notifications.objectNotCreated',
              {
                type: this.translateService
                  .instant('common.application.one')
                  .toLowerCase(),
                error: res.errors[0].message,
              }
            ),
            { error: true }
          );
        } else {
          if (res.data) {
            this.snackBar.openSnackBar(
              this.translateService.instant(
                'common.notifications.objectCreated',
                {
                  type: this.translateService
                    .instant('common.application.one')
                    .toLowerCase(),
                  value: res.data.addApplication.name,
                }
              )
            );
            const id = res.data.addApplication.id;
            this.router.navigate(['/applications', id]);
          }
        }
      });
  }

  /**
   * Edits the permissions layer.
   *
   * @param e permissions.
   * @param element application.
   */
  saveAccess(e: any, element: Application): void {
    this.apollo
      .mutate<EditApplicationMutationResponse>({
        mutation: EDIT_APPLICATION,
        variables: {
          id: element.id,
          permissions: e,
        },
      })
      .subscribe((res) => {
        if (res.data) {
          this.snackBar.openSnackBar(
            this.translateService.instant(
              'common.notifications.objectUpdated',
              {
                type: this.translateService
                  .instant('action.access')
                  .toLowerCase(),
                value: element.name,
              }
            )
          );
          const index = this.applications.data.findIndex(
            (x) => x.id === element.id
          );
          this.applications.data[index] = res.data.editApplication;
          this.applications.data = this.applications.data;
        }
      });
  }

  /**
   * Opens a dialog to choose roles to fit in the preview.
   *
   * @param element application to preview.
   */
  onPreview(element: Application): void {
    const dialogRef = this.dialog.open(ChoseRoleComponent, {
      data: {
        application: element.id,
      },
    });
    dialogRef.afterClosed().subscribe((value) => {
      if (value) {
        this.previewService.setRole(value.role);
        this.router.navigate(['./app-preview', element.id]);
      }
    });
  }

  /**
   * Opens a dialog to give a name for the duplicated application.
   *
   * @param application application to duplicate.
   */
  onClone(application: Application): void {
    const dialogRef = this.dialog.open(DuplicateApplicationComponent, {
      data: {
        id: application.id,
        name: application.name,
      },
    });
    dialogRef.afterClosed().subscribe((value) => {
      if (value) {
        this.applications.data.push(value);
        this.applications.data = this.applications.data;
      }
    });
  }

  /**
   * Navigates to application.
   *
   * @param id application id.
   */
  onOpenApplication(id: string): void {
    this.router.navigate(['/applications', id]);
  }
}
