import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import get from 'lodash/get';
import {
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  takeUntil,
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SafeAggregationService } from '../../../services/aggregation/aggregation.service';
import { SafeGridLayoutService } from '../../../services/grid-layout/grid-layout.service';
import { QueryBuilderService } from '../../../services/query-builder/query-builder.service';
import {
  GetResourceMetadataQueryResponse,
  GET_RESOURCE_METADATA,
} from './graphql/queries';
import { SafeUnsubscribeComponent } from '../../utils/unsubscribe/unsubscribe.component';
import { SummaryCardFormT } from '../summary-card-settings/summary-card-settings.component';
import { Record } from '../../../models/record.model';

export type CardT = NonNullable<SummaryCardFormT['value']['card']> &
  Partial<{
    record: Record;
    metadata: any[];
    layout: Layout;
    cardAggregationData: any;
  }>;
import { Layout } from '../../../models/layout.model';
import { FormControl } from '@angular/forms';
import { clone, isNaN } from 'lodash';
import { SnackbarService, UIPageChangeEvent } from '@oort-front/ui';
import { Dialog } from '@angular/cdk/dialog';

/** Maximum width of the widget in column units */
const MAX_COL_SPAN = 8;

/** Default page size for pagination */
const DEFAULT_PAGE_SIZE = 25;

/**
 * Summary Card Widget component.
 */
@Component({
  selector: 'safe-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.scss'],
})
export class SafeSummaryCardComponent
  extends SafeUnsubscribeComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() widget: any;
  @Input() header = true;
  @Input() export = true;
  @Input() settings!: SummaryCardFormT['value'];

  public gridSettings: any = null;

  public displayMode: 'cards' | 'grid' = 'cards';
  // === GRID ===
  public colsNumber = MAX_COL_SPAN;

  public pageInfo = {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    length: 0,
    skip: 0,
  };
  public loading = true;

  public cards: CardT[] = [];
  private cachedCards: CardT[] = [];
  private sortedCachedCards: CardT[] = [];
  private dataQuery!: QueryRef<any>;

  private layout: Layout | null = null;
  private fields: any[] = [];

  public searchControl = new FormControl('');
  public scrolling = false;

  private filters: any = null;

  @ViewChild('summaryCardGrid') summaryCardGrid!: ElementRef<HTMLDivElement>;
  @ViewChild('pdf') pdf!: any;

  /**
   * Get the summary card pdf name
   *
   * @returns export name of the summary card
   */
  get exportName(): string {
    const today = new Date();
    const formatDate = `${today.toLocaleString('en-us', {
      month: 'short',
      day: 'numeric',
    })} ${today.getFullYear()}`;
    return `${
      this.settings.title ? this.settings.title : 'Summary Card'
    } ${formatDate}.pdf`;
  }

  /**
   * Changes display when windows size changes.
   *
   * @param event window resize event
   */
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any): void {
    this.colsNumber = this.setColsNumber(event.target.innerWidth);
  }

  /**
   * Constructor for summary card component
   *
   * @param apollo Apollo service
   * @param dialog Dialog service
   * @param snackBar Shared snackbar service
   * @param translate Angular translate service
   * @param queryBuilder Query builder service
   * @param gridLayoutService Shared grid layout service
   * @param aggregationService Aggregation service
   */
  constructor(
    private apollo: Apollo,
    private dialog: Dialog,
    private snackBar: SnackbarService,
    private translate: TranslateService,
    private queryBuilder: QueryBuilderService,
    private gridLayoutService: SafeGridLayoutService,
    private aggregationService: SafeAggregationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.setupDynamicCards();

    this.colsNumber = this.setColsNumber(window.innerWidth);
    this.setupGridSettings();

    this.searchControl.valueChanges
      .pipe(debounceTime(2000), distinctUntilChanged())
      .subscribe((value) => {
        this.handleSearch(value || '');
      });
  }

  ngAfterViewInit(): void {
    if (!this.settings.widgetDisplay?.usePagination) {
      this.summaryCardGrid.nativeElement.addEventListener(
        'scroll',
        (event: any) => {
          this.loadOnScroll(event);
        }
      );
    }
  }

  /**
   * Changes the number of displayed columns.
   *
   * @param width width of the screen.
   * @returns new number of cols.
   */
  private setColsNumber(width: number): number {
    if (width <= 480) {
      return 1;
    }
    if (width <= 600) {
      return 2;
    }
    if (width <= 800) {
      return 4;
    }
    if (width <= 1024) {
      return 6;
    }
    return MAX_COL_SPAN;
  }

  /** Gets the query for fetching the dynamic cards records. */
  private async setupDynamicCards() {
    // only one dynamic card is allowed per widget
    const card = this.settings.card;
    if (!card) return;

    if (card.aggregation) this.getCardsFromAggregation(card);
    else if (card.layout) this.createDynamicQueryFromLayout(card);
  }

  /**
   * Handles the search on cards
   *
   * @param search search value
   */
  private handleSearch(search: string) {
    // Only need to fetch data if is dynamic and not an aggregation
    const needRefetch = !this.settings.card?.aggregation;
    const skippedFields = ['id', 'incrementalId'];
    this.pageInfo.pageIndex = 0;
    this.pageInfo.skip = 0;

    if (!needRefetch) {
      this.sortedCachedCards = this.cachedCards.filter((card: any) => {
        const data = clone(card.record || card.cardAggregationData || {});
        skippedFields.forEach((field) => delete data[field]);
        const recordValues = Object.values(data);
        return recordValues.some(
          (value) =>
            (typeof value === 'string' &&
              value.toLowerCase().includes(search.toLowerCase()) &&
              !skippedFields.includes(value)) ||
            (!isNaN(parseFloat(search)) &&
              typeof value === 'number' &&
              value === parseFloat(search))
        );
      });
      this.cards = this.sortedCachedCards.slice(0, this.pageInfo.pageSize);
      this.pageInfo.length = this.sortedCachedCards.length;
    } else {
      this.loading = true;
      const filters: {
        field: string;
        operator: string;
        value: string | number;
      }[] = [];
      this.fields.forEach((field) => {
        if (skippedFields.includes(field.name)) return;
        if (field?.type === 'text')
          filters.push({
            field: field.name,
            operator: 'contains',
            value: search,
          });
        if (field?.type === 'numeric' && !isNaN(parseFloat(search)))
          filters.push({
            field: field.name,
            operator: 'eq',
            value: parseFloat(search),
          });
      });
      const searchFilter = {
        logic: 'or',
        filters,
      };

      this.filters = {
        logic: 'and',
        filters: [searchFilter, this.layout?.query.filter],
      };

      this.dataQuery
        ?.refetch({
          skip: 0,
          first: this.pageInfo.pageSize,
          filter: this.filters,
        })
        .then(this.updateCards.bind(this));
    }
  }

  /**
   * Updates the cards from fetched custom query
   *
   * @param res Query result
   */
  private updateCards(res: any) {
    if (!res?.data) return;
    let newCards: any[] = [];

    const layoutQueryName = this.layout?.query.name;
    if (this.layout) {
      const edges = res.data?.[layoutQueryName].edges;
      if (!edges) return;

      newCards = edges.map((e: any) => ({
        ...this.settings.card,
        record: e.node,
        layout: this.layout,
        metadata: this.fields,
        style: e.meta.style,
      }));
    } else if (this.settings.card?.aggregation) {
      if (!res.data?.recordsAggregation?.items) return;
      newCards = res.data.recordsAggregation.items.map((x: any) => ({
        ...this.settings.card,
        cardAggregationData: x,
      }));
    } else {
      return;
    }

    // scrolling enabled
    if (!this.settings.widgetDisplay?.usePagination && this.scrolling) {
      this.cards = [...this.cards, ...newCards];
      this.scrolling = false;
    } else {
      this.cards = newCards;

      this.summaryCardGrid.nativeElement.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }
    this.pageInfo.length = get(
      res.data[layoutQueryName ?? 'recordsAggregation'],
      'totalCount',
      0
    );

    this.loading = res.loading;
  }

  /**
   * Gets the query for fetching the dynamic cards records from a card's settings
   *
   * @param card Card settings
   */
  private async createDynamicQueryFromLayout(card: any) {
    // gets metadata
    const metaRes = await firstValueFrom(
      this.apollo.query<GetResourceMetadataQueryResponse>({
        query: GET_RESOURCE_METADATA,
        variables: {
          id: card.resource,
        },
      })
    );

    this.gridLayoutService
      .getLayouts(card.resource, { ids: [card.layout], first: 1 })
      .then((res) => {
        const layouts = res.edges.map((edge) => edge.node);
        if (layouts.length > 0) {
          this.layout = layouts[0];
          const layoutQuery = this.layout.query;
          const builtQuery = this.queryBuilder.buildQuery({
            query: layoutQuery,
          });
          const layoutFields = layoutQuery.fields;
          this.fields = get(metaRes, 'data.resource.metadata', []).map(
            (f: any) => {
              const layoutField = layoutFields.find(
                (lf: any) => lf.name === f.name
              );
              if (layoutField) {
                return { ...layoutField, ...f };
              }
              return f;
            }
          );

          if (builtQuery) {
            this.filters = layoutQuery.filter;
            this.dataQuery = this.apollo.watchQuery<any>({
              query: builtQuery,
              variables: {
                first: DEFAULT_PAGE_SIZE,
                filter: this.filters,
                sortField: get(layoutQuery, 'sort.field', null),
                sortOrder: get(layoutQuery, 'sort.order', ''),
                styles: layoutQuery.style || null,
              },
              fetchPolicy: 'network-only',
              nextFetchPolicy: 'cache-first',
            });
            this.dataQuery.valueChanges
              .pipe(takeUntil(this.destroy$))
              .subscribe(this.updateCards.bind(this));
          }
        }
      });
  }

  /**
   * mdr
   */
  private async setupGridSettings() {
    const card = this.settings.card;
    if (!card || !card.resource || !card.layout) return;

    this.gridLayoutService
      .getLayouts(card.resource, { ids: [card.layout], first: 1 })
      .then((res) => {
        const layouts = res.edges.map((edge) => edge.node);
        if (layouts.length > 0) {
          const layout = layouts[0] || null;
          this.gridSettings = {
            ...{ template: get(this.settings, 'template', null) }, //TO MODIFY
            ...{ resource: card.resource },
            ...{ layouts: layout.id },
            ...{
              actions: {
                //default actions, might need to modify later
                addRecord: false,
                convert: true,
                delete: true,
                export: true,
                history: true,
                inlineEdition: true,
                showDetails: true,
                update: true,
              },
            },
          };
        }
      });
    return;
  }

  /**
   * Gets the query for fetching the dynamic cards records from a card's settings
   *
   * @param card Card settings
   */
  private async getCardsFromAggregation(
    card: NonNullable<SummaryCardFormT['value']['card']>
  ) {
    if (!card.aggregation || !card.resource) return;
    this.loading = true;
    this.dataQuery = this.aggregationService.aggregationDataWatchQuery(
      card.resource,
      card.aggregation,
      DEFAULT_PAGE_SIZE,
      0
    );

    this.dataQuery.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.updateCards.bind(this));
  }

  /**
   * Load more items on scroll.
   *
   * @param e scroll event
   */
  private loadOnScroll(e: any): void {
    if (
      e.target.scrollHeight - (e.target.clientHeight + e.target.scrollTop) <
      50
    ) {
      if (!this.scrolling && this.pageInfo.length > this.cards.length) {
        this.dataQuery
          ?.fetchMore({
            variables: {
              skip: this.cards.length,
            },
          })
          .then(this.updateCards.bind(this));
        this.scrolling = true;
      }
    }
  }

  /**
   * Detects pagination events and update the items loaded.
   *
   * @param event Page change event.
   */
  public onPage(event: UIPageChangeEvent): void {
    this.pageInfo.pageSize = event.pageSize;
    this.pageInfo.skip = event.skip;

    if (this.dataQuery) {
      this.loading = true;
      const layoutQuery = this.layout?.query;
      this.dataQuery
        .refetch({
          first: this.pageInfo.pageSize,
          skip: event.skip,
          filters: this.filters,
          sortField: get(layoutQuery, 'sort.field', null),
          sortOrder: get(layoutQuery, 'sort.order', ''),
          styles: layoutQuery?.style || null,
        })
        .then(this.updateCards.bind(this));
    }
  }

  /**
   * Open the dataSource modal.
   */
  public async openDataSource(): Promise<void> {
    if (this.layout?.query) {
      const { SafeResourceGridModalComponent } = await import(
        '../../search-resource-grid-modal/search-resource-grid-modal.component'
      );
      this.dialog.open(SafeResourceGridModalComponent, {
        data: {
          gridSettings: clone(this.layout.query),
        },
      });
    } else {
      this.snackBar.openSnackBar(
        this.translate.instant(
          'components.widget.summaryCard.errors.invalidSource'
        ),
        { error: true }
      );
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
