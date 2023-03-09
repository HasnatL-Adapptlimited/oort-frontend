import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SafeButtonModule } from '../../button/button.module';
import { SafeIconModule } from '../../icon/icon.module';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import {
  FormGroup,
  FormsModule,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SafeDividerModule } from '../../divider/divider.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * Map download component
 */
@Component({
  standalone: true,
  selector: 'safe-map-download',
  templateUrl: './map-download.component.html',
  imports: [
    CommonModule,
    SafeButtonModule,
    SafeIconModule,
    SafeDividerModule,
    MatRadioModule,
    MatSelectModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
  styleUrls: ['./map-download.component.scss'],
})
export class MapDownloadComponent {
  public expanded = false;
  public viewOptions = [
    {
      label: this.translate.instant(
        'components.map.controls.download.view.all'
      ),
      value: 'map',
    },
    {
      label: this.translate.instant(
        'components.map.controls.download.view.current'
      ),
      value: 'current',
    },
  ];
  public layersOptions = [
    {
      label: this.translate.instant(
        'components.map.controls.download.layers.all'
      ),
      value: 'all',
    },
    {
      label: this.translate.instant(
        'components.map.controls.download.layers.visible'
      ),
      value: 'visible',
    },
    {
      label: this.translate.instant(
        'components.map.controls.download.layers.selected'
      ),
      value: 'selected',
    },
  ];
  public layers: { label: string }[] = [
    {
      label: 'layer 1',
    },
    {
      label: 'layer 2',
    },
  ];
  public outputOptions = ['csv', 'xlsx', 'geojson', 'png'];
  public formGroup: FormGroup;

  /**
   * Creates the form to handle the layers selection
   *
   * @param fb form builder
   * @param translate common translate service
   */
  constructor(private fb: FormBuilder, private translate: TranslateService) {
    this.formGroup = fb.group({
      view: ['map', Validators.required],
      layers: ['all', Validators.required],
      selectedLayers: [{ value: [] as string[] }],
      output: ['xlsx', Validators.required],
    });
  }

  /**
   * Toggles the display of the popup download menu.
   * If the element is hidden, it will be shown. If the element is shown, it will be hidden when clicking.
   */
  public toggleVisibility(): void {
    this.expanded = !this.expanded;
  }
}
