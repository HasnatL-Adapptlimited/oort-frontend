import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { SnackBarConfig } from './interfaces/snackbar.interfaces';
import { ComponentType } from '@angular/cdk/portal';
import { SnackBarData, SNACKBAR_DATA } from './snackbar.token';
import { BehaviorSubject } from 'rxjs';

/**
 * UI Snackbar component
 */
@Component({
  selector: 'ui-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
})
export class SnackbarComponent {
  @Output() actionComplete = new EventEmitter<void>();
  @ViewChild('snackBarContent', { static: true, read: ViewContainerRef })
  snackBarContentView!: ViewContainerRef;

  data!: BehaviorSubject<SnackBarData>;
  message!: string;
  error = false;
  displaySnackBar = false;
  action!: string;
  durationResolver = (duration: number) =>
    new Promise((resolve) => setTimeout(resolve, duration));

  /**
   * UI Snackbar constructor
   *
   * @param host Class instance host element
   * @param data Snackbar data token to update value
   */
  constructor(
    private host: ElementRef<any>,
    @Inject(SNACKBAR_DATA) data: BehaviorSubject<SnackBarData>
  ) {
    this.data = data;
  }

  /**
   * Set snackbar properties
   *
   * @param config Snackbar config
   * @param message Snackbar message
   */
  private setSnackbarProperties(config: SnackBarConfig, message: string = '') {
    this.error = config.error ?? false;
    this.message = message;
    this.action = config.action ?? '';
    this.data.next(config.data);
    this.snackBarContentView?.clear();
  }

  /**
   * Set snackbar display timeout with the given config duration
   *
   * @param duration Snackbar display duration
   */
  private async triggerSnackBar(duration: number | undefined) {
    this.displaySnackBar = true;
    await this.durationResolver(duration ?? 0);
    if (duration) {
      this.dismiss();
    }
  }

  /**
   * Trigger remove animation and removes the host instance from the dom
   */
  dismiss() {
    this.displaySnackBar = false;
    setTimeout(() => {
      this.host.nativeElement.remove();
    }, 300);
  }

  /**
   * Trigger the action event for the parent using the snackbar reference
   */
  triggerActionEvent() {
    this.dismiss();
    this.actionComplete.emit();
  }

  /**
   * Display snackbar with the given message and config
   *
   * @param message Message to display in the snackbar
   * @param config Snackbar config
   */
  open(message: string, config: SnackBarConfig) {
    this.setSnackbarProperties(config, message);
    this.triggerSnackBar(config.duration);
  }

  /**
   * Display snackbar with the given component and config
   *
   * @param component Component to render in the snackbar
   * @param config Snackbar config
   */
  openFromComponent(component: ComponentType<any>, config: SnackBarConfig) {
    this.setSnackbarProperties(config);
    this.snackBarContentView?.createComponent(component);
    this.triggerSnackBar(config.duration);
  }

  /**
   * Display snackbar with the given templateRef and config
   *
   * @param template TemplateRef to render in the snackbar
   * @param config Snackbar config
   */
  openFromTemplate(template: TemplateRef<any>, config: SnackBarConfig) {
    this.setSnackbarProperties(config);
    this.snackBarContentView?.createEmbeddedView(template);
    this.triggerSnackBar(config.duration);
  }
}
