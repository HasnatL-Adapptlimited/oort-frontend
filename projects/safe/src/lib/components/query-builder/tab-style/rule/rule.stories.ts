import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { SafeRuleComponent } from './rule.component';
import { SafeQueryBuilderModule } from '../../query-builder.module';

export default {
  component: SafeRuleComponent,
  decorators: [
    moduleMetadata({
      imports: [SafeQueryBuilderModule],
    }),
  ],
  title: 'UI/Rule',
} as Meta;

const TEMPLATE_DEFAULT: Story<SafeRuleComponent> = (args) => ({
  template: `<safe-rule [stylesList]="stylesList" [styleForm]="styleForm" [scalarFields]="scalarFields" [settings]="settings"
  [availableFields]="availableFields" [factory]="factory"></safe-rule>`,
  props: {
    ...args
  },
});

export const DEFAULT = TEMPLATE_DEFAULT.bind({});
DEFAULT.args = {
  styleForm: {
    "formGroup": {
      title: [`New rule`],
      backgroundColor: '#1a0e06',
      textColor: '#5dfdad',
      textStyle: 'default',
      styleAppliedTo: 'whole-row',
      fields: [],
      filter: {
        logic: 'and',
        filters: [],
      },
    },
  } as any,
};
