import { Index, ParentComponent, createSignal } from 'solid-js';

import Checkbox, { CheckboxSize } from '@/ui/checkbox';

import * as styles from './CheckboxesPage.css';

const sizeEntries: ReadonlyArray<{
  readonly size: CheckboxSize;
  readonly label: string;
}> = [
  { size: 'sm', label: 'Small' },
  { size: 'md', label: 'Medium' },
  { size: 'lg', label: 'Large' },
];

const DemoSection: ParentComponent<{ title: string }> = (props) => (
  <section class={styles.section}>
    <h2 class={styles.heading}>{props.title}</h2>
    {props.children}
  </section>
);

const CheckboxesPage = () => {
  const [checked, setChecked] = createSignal(true);
  const [unchecked, setUnchecked] = createSignal(false);
  const [indeterminate, setIndeterminate] = createSignal(true);

  return (
    <div class={styles.page}>
      <DemoSection title="Sizes">
        <div class={styles.col}>
          <Index each={sizeEntries}>
            {(item) => (
              <Checkbox size={item().size} checked={true} readOnly>
                {item().label}
              </Checkbox>
            )}
          </Index>
        </div>
      </DemoSection>

      <DemoSection title="States">
        <div class={styles.col}>
          <Checkbox
            checked={unchecked()}
            onChange={(e) => setUnchecked(e.currentTarget.checked)}>
            Unchecked
          </Checkbox>
          <Checkbox
            checked={checked()}
            onChange={(e) => setChecked(e.currentTarget.checked)}>
            Checked
          </Checkbox>
          <Checkbox
            checked={true}
            indeterminate={indeterminate()}
            onChange={(e) => {
              setIndeterminate(false);
              setChecked(e.currentTarget.checked);
            }}>
            Indeterminate
          </Checkbox>
          <Checkbox disabled>Disabled unchecked</Checkbox>
          <Checkbox checked disabled>
            Disabled checked
          </Checkbox>
        </div>
      </DemoSection>

      <DemoSection title="Without labels (standalone)">
        <div class={styles.row}>
          <Checkbox checked={false} aria-label="Unchecked" />
          <Checkbox checked={true} aria-label="Checked" />
          <Checkbox
            indeterminate={true}
            checked={true}
            aria-label="Indeterminate"
          />
          <Checkbox disabled aria-label="Disabled" />
        </div>
      </DemoSection>

      <DemoSection title="Shopping list use case">
        <div class={styles.col}>
          <Checkbox checked={true}>Milk (2 liters)</Checkbox>
          <Checkbox checked={false}>Eggs (12 pack)</Checkbox>
          <Checkbox checked={true}>Bread - whole grain</Checkbox>
          <Checkbox checked={false}>Butter (250g)</Checkbox>
        </div>
      </DemoSection>
    </div>
  );
};

export default CheckboxesPage;
