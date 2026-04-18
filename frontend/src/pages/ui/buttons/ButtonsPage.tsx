import IconArrowRight from 'lucide-solid/icons/arrow-right';
import IconPlus from 'lucide-solid/icons/plus';
import IconTrash from 'lucide-solid/icons/trash-2';
import { For, ParentComponent } from 'solid-js';

import Button, { ButtonSize, type ButtonVariant } from '@/ui/button';

import styles from './ButtonsPage.module.scss';

const variantEntries: ReadonlyArray<[ButtonVariant, string]> = [
  ['primary', 'Primary'],
  ['secondary', 'Secondary'],
  ['destructive', 'Destructive'],
  ['ghost', 'Ghost'],
];

const sizeEntries: ReadonlyArray<[ButtonSize, string]> = [
  ['sm', 'Small'],
  ['md', 'Medium'],
  ['lg', 'Large'],
];

const DemoSection: ParentComponent<{ title: string }> = (props) => (
  <section class={styles.section}>
    <h2 class={styles.heading}>{props.title}</h2>
    <div class={styles.row}>{props.children}</div>
  </section>
);

const ButtonsPage = () => {
  return (
    <div class={styles.page}>
      <DemoSection title="Variants">
        <For each={variantEntries}>
          {([variant, label]) => <Button variant={variant}>{label}</Button>}
        </For>
      </DemoSection>

      <DemoSection title="Sizes">
        <For each={sizeEntries}>
          {([size, label]) => <Button size={size}>{label}</Button>}
        </For>
      </DemoSection>

      <DemoSection title="Icons">
        <Button startIcon={<IconPlus size={18} />}>Start icon</Button>
        <Button endIcon={<IconArrowRight size={18} />}>End icon</Button>
        <Button
          startIcon={<IconTrash size={18} />}
          variant="destructive"
          endIcon={<IconArrowRight size={18} />}>
          Both icons
        </Button>
      </DemoSection>

      <DemoSection title="States">
        <Button disabled>Disabled</Button>
        <Button variant="secondary" disabled>
          Disabled
        </Button>
        <Button loading>Loading</Button>
        <Button variant="secondary" loading>
          Loading
        </Button>
      </DemoSection>

      <section class={styles.section}>
        <h2 class={styles.heading}>Full width</h2>
        <Button fullWidth>Full width</Button>
      </section>
    </div>
  );
};

export default ButtonsPage;
