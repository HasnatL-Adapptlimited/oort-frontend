import { OverlayContainer } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { Injectable } from '@angular/core';

@Injectable()
export class AppOverlayContainer extends OverlayContainer {
  constructor(document: Document, _platform: Platform) {
    super(document, _platform);
  }

  protected _createContainer(): void {
    console.log('there');
    const container: HTMLDivElement = document.createElement('div');
    container.classList.add('app-overlay-container');

    const element = document
      .querySelector('dashboard-widget')
      ?.shadowRoot?.querySelector('#angular-app-root');
    if (element) {
      element.appendChild(container);
      // eslint-disable-next-line no-underscore-dangle
      this._containerElement = container;
    }
  }
}
