import { Component, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { saveAs } from '@progress/kendo-file-saver';
import { ChartComponent } from '@progress/kendo-angular-charts';
import { Subscription } from 'rxjs';
import { QueryBuilderService } from '../../../services/query-builder.service';
import { BAR, CIRCULAR, COLUMN, LINE, SCATTER } from './mock';

const DEFAULT_FILE_NAME = 'chart.png';

@Component({
  selector: 'who-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
/*  Chart widget using KendoUI.
*/
export class WhoChartComponent implements OnChanges, OnDestroy {

  // === DATA ===
  public loading = true;
  public data = [];
  private dataQuery: any;
  private dataSubscription: Subscription;

  // === WIDGET CONFIGURATION ===
  @Input() header = true;
  @Input() export = true;
  @Input() settings: any = null;

  get chartData(): any {
    switch (this.settings.chart.type) {
      case 'line':
        return LINE;
      case 'verticalLine':
        return LINE;
      case 'donut':
        return CIRCULAR;
      case 'pie':
        return CIRCULAR;
      case 'bar':
        return BAR;
      case 'column':
        return COLUMN;
      // case 'area':
      //   return AREA;
      // case 'verticalArea':
      //   return AREA;
      case 'scatter':
        return SCATTER;
      case 'scatterLine':
        return SCATTER;
      default:
        return null;
    }
  }

  // === CHART ===
  @ViewChild('chart')
  private chart: ChartComponent;

  constructor(
    private queryBuilder: QueryBuilderService
  ) {}

  /*  Detect changes of the settings to reload the data.
  */
  ngOnChanges(): void {
    this.loading = false;
    // this.dataQuery = this.queryBuilder.buildQuery(this.settings);
    // if (this.dataQuery) {
    //   this.getData();
    // } else {
    //   this.loading = false;
    // }
  }

  public onExport(): void {
    this.chart.exportImage({
      width: 1200,
      height: 800
    }).then((dataURI) => {
      saveAs(dataURI, this.settings.name ? `${this.settings.name}.png` : DEFAULT_FILE_NAME);
    });
  }

  /*  Load the data, using widget parameters.
  */
  private getData(): void {
    this.dataSubscription = this.dataQuery.valueChanges.subscribe(res => {
      this.data = [];
      const dataToAggregate = [];
      for (const field in res.data) {
        if (Object.prototype.hasOwnProperty.call(res.data, field)) {
          for (const record of res.data[field]) {
            const existingField = dataToAggregate.find(x => {
              return x[this.settings.xAxis] === record[this.settings.xAxis];
            });
            if (existingField) {
              existingField[this.settings.yAxis] += record[this.settings.yAxis];
            } else {
              dataToAggregate.push(record);
            }
          }
        }
      }
      this.data = dataToAggregate;
      this.loading = res.loading;
    });
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}
