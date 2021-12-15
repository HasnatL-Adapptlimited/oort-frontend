import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { QueryBuilderService } from '../../../services/query-builder.service';
import { SafeArcGISService } from '../../../services/arc-gis.service';
@Component({
  selector: 'safe-map-settings',
  templateUrl: './map-settings.component.html',
  styleUrls: ['./map-settings.component.scss']
})
/*  Modal content for the settings of the map widgets.
*/
export class SafeMapSettingsComponent implements OnInit {

  // === REACTIVE FORM ===
  tileForm: FormGroup | undefined;

  // === WIDGET ===
  @Input() tile: any;

  // === EMIT THE CHANGES APPLIED ===
  // tslint:disable-next-line: no-output-native
  @Output() change: EventEmitter<any> = new EventEmitter();

  public selectedFields: any[] = [];

  public basemaps: any[] = [
    'Sreets',
    'Navigation',
    'Topographic',
    'Light Gray',
    'Dark Gray',
    'Streets Relief',
    'Imagery',
    'ChartedTerritory',
    'ColoredPencil',
    'Nova',
    'Midcentury',
    'OSM',
    'OSM:Streets'
  ];

  public search = '';
  public suggestions: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private queryBuilder: QueryBuilderService,
    private arcGisService: SafeArcGISService
  ) { }

  /*  Build the settings form, using the widget saved parameters.
  */
  ngOnInit(): void {
    const tileSettings = this.tile.settings;
    this.tileForm = this.formBuilder.group({
      id: this.tile.id,
      title: [(tileSettings && tileSettings.title) ? tileSettings.title : null],
      query: this.queryBuilder.createQueryForm(tileSettings.query),
      latitude: [(tileSettings && tileSettings.latitude) ? tileSettings.latitude : null, Validators.required],
      longitude: [(tileSettings && tileSettings.longitude) ? tileSettings.longitude : null, Validators.required],
      category: [(tileSettings && tileSettings.category) ? tileSettings.category : null],
      mapbase: [(tileSettings && tileSettings.mapbase) ? tileSettings.mapbase : null],
      zoom: [(tileSettings && tileSettings.zoom) ? tileSettings.zoom : null],
      centerLong: [(tileSettings && tileSettings.centerLong) ? tileSettings.centerLong : null, [Validators.min(-180), Validators.max(180)]],
      centerLat: [(tileSettings && tileSettings.centerLat) ? tileSettings.centerLat : null, [Validators.min(-90), Validators.max(90)]],
      onlineLayers: [(tileSettings && tileSettings.onlineLayers) ? tileSettings.onlineLayers : []]
    });
    this.change.emit(this.tileForm);
    this.tileForm?.valueChanges.subscribe(() => {
      this.change.emit(this.tileForm);
    });

    if (this.tileForm?.value.query.name) {
      this.selectedFields = this.getFields(this.tileForm?.value.query.fields);
    }

    const queryForm = this.tileForm.get('query') as FormGroup;

    queryForm.controls.name.valueChanges.subscribe(() => {
      this.tileForm?.controls.latitude.setValue('');
      this.tileForm?.controls.longitude.setValue('');
      this.tileForm?.controls.category.setValue('');
    });
    queryForm.valueChanges.subscribe((res) => {
      this.selectedFields = this.getFields(queryForm.getRawValue().fields);
    });

    this.arcGisService.clearItem();

    // tileSettings.onlineLayers.map((x: any) => {this.tileForm!.value.onlineLayers.push(x);});

    this.arcGisService.suggestions$.subscribe(suggestions => {
      this.suggestions = suggestions;
    });

    this.arcGisService.currentItem$.subscribe(item => {
      if (item.id) {
        this.tileForm!.value.onlineLayers.push(item);
      }
    });
  }

  private flatDeep(arr: any[]): any[] {
    return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? this.flatDeep(val) : val), []);
  }

  private getFields(fields: any[], prefix?: string): any[] {
    return this.flatDeep(fields.filter(x => x.kind !== 'LIST').map(f => {
      switch (f.kind) {
        case 'OBJECT': {
          return this.getFields(f.fields, f.name);
        }
        default: {
          return prefix ? `${prefix}.${f.name}` : f.name;
        }
      }
    }));
  }

  public getContent(): void
  {
    if (this.search == '') {
      this.arcGisService.clearSuggestions();
    }
    else {
      this.arcGisService.getSuggestions(this.search);
    }
  }

  public addOnlineLayer(layer: any): void
  {
    this.search = '';
    this.arcGisService.getItem(layer.id);
    this.arcGisService.clearSuggestions();
  }

  public removeOnlineLayer(id: string): void
  {
    this.tileForm?.removeControl('onlineLayers');
    console.log(this.tile.settings);
  }

}
