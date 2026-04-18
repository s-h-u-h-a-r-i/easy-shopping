import { Index, ParentComponent } from 'solid-js';

import Input, { InputSize } from '@/ui/input';

import { IconEye, IconSearch } from '@/ui/icons';
import styles from './InputsPage.module.scss';

const sizeEntries: ReadonlyArray<{
  readonly size: InputSize;
  readonly label: string;
}> = [
  {
    size: 'sm',
    label: 'Small',
  },
  {
    size: 'md',
    label: 'Medium',
  },
  {
    size: 'lg',
    label: 'Large',
  },
];

const DemoSection: ParentComponent<{ title: string }> = (props) => (
  <section class={styles.section}>
    <h2 class={styles.heading}>{props.title}</h2>
    {props.children}
  </section>
);

const InputsPage = () => (
  <div class={styles.page}>
    <DemoSection title="Sizes">
      <div class={styles.col}>
        <Index each={sizeEntries}>
          {(item) => (
            <Input
              size={item().size}
              placeholder={item().label}
              label={item().label}
            />
          )}
        </Index>
      </div>
    </DemoSection>

    <DemoSection title="Icons">
      <div class={styles.col}>
        <Input
          startIcon={<IconSearch size={14} />}
          placeholder="Search..."
          label="Start icon"
        />
        <Input
          endIcon={<IconEye size={15} />}
          placeholder="Password"
          label="End icon"
          type="password"
        />
      </div>
    </DemoSection>

    <DemoSection title="States">
      <div class={styles.col}>
        <Input
          label="With hint"
          placeholder="Enter value"
          hint="This is a helpful hint."
        />
        <Input
          label="Error"
          placeholder="Enter value"
          error="This field is required."
        />
        <Input label="Disabled" placeholder="Cannot edit" disabled />
      </div>
    </DemoSection>

    <section class={styles.section}>
      <Input
        fullWidth
        label="Full width"
        placeholder="Stretches to container"
      />
    </section>
  </div>
);

export default InputsPage;
