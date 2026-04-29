import { Bug } from 'lucide-solid';
import { createSignal } from 'solid-js';

import * as styles from './DevPanel.css';

const DevPanel = () => {
  const [open, setOpen] = createSignal(false);

  return (
    <div class={styles.root}>
      {open() && <div class={styles.panel} />}

      <button
        class={styles.toggle}
        onClick={() => setOpen((o) => !o)}
        title="Dev panel"
      >
        <Bug size={14} />
      </button>
    </div>
  );
};

export default DevPanel;
