import {
  Meta,
  moduleMetadata,
  StoryFn,
  componentWrapperDecorator,
} from '@storybook/angular';
import { SafePieDonutChartComponent } from './pie-donut-chart.component';
import { SafePieDonutChartModule } from './pie-donut-chart.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export default {
  component: SafePieDonutChartComponent,
  decorators: [
    moduleMetadata({
      imports: [SafePieDonutChartModule, BrowserAnimationsModule],
      providers: [],
    }),
    componentWrapperDecorator((story) => `<div class="h-96">${story}</div>`),
  ],
  title: 'UI/Charts/Pie Chart',
  argTypes: {
    series: {
      control: { type: 'object' },
    },
    legend: {
      control: { type: 'object' },
    },
    title: {
      control: { type: 'object' },
    },
  },
} as Meta;

/**
 * Stories template used to render the component
 *
 * @param args Arguments used by the component
 * @returns Returns an object used as the stories template
 */
const TEMPLATE: StoryFn<SafePieDonutChartComponent> = (args) => ({
  props: {
    ...args,
  },
});

/**
 * Default story
 */
export const DEFAULT = {
  render: TEMPLATE,
  name: 'Default',

  args: {
    series: [
      {
        data: [
          {
            field: 2,
            category: 'category 1',
          },
          {
            field: 7,
            category: 'category 2',
          },
          {
            field: 19,
            category: 'category 3',
          },
          {
            field: 16,
            category: 'category 4',
          },
        ],
      },
    ],
  },
};

/**
 * Donut story
 */
export const DOUGHNUT = {
  render: TEMPLATE,
  name: 'Doughnut',

  args: {
    ...DEFAULT.args,
    chartType: 'doughnut',
  },
};
