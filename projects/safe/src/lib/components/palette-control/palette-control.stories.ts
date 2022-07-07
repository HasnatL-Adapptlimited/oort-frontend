import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafePaletteControlComponent } from './palette-control.component';
import { SafePaletteControlModule } from './palette-control.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export default {
  component: SafePaletteControlComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        SafePaletteControlModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [],
    }),
  ],
  title: 'UI/Controls/Palette',
} as Meta;

/**
 *
 * @param args
 */
const TEMPLATE: Story<SafePaletteControlComponent> = (args) => ({
  // template:
  //   '<safe-palette-control [formControl]="palette"></safe-palette-control>',
  props: {
    ...args,
    // palette: new FormControl(['red', 'blue']),
  },
});

/**
 *
 */
const COLORS = [
  '#FF8C00',
  '#B0C4DE',
  '#ADD8E6',
  '#BC8F8F',
  '#DA70D6',
  '#CD5C5C',
  '#48D1CC',
  '#FF00FF',
  '#6495ED',
  '#FF0000',
];

/**
 *
 */
export const DEFAULT = TEMPLATE.bind({});
DEFAULT.args = {
  formControl: new FormControl(COLORS),
  colors: COLORS,
};

/**
 *
 */
export const DISABLED = TEMPLATE.bind({});
DISABLED.args = {
  formControl: new FormControl({ value: COLORS, disabled: true }),
};
