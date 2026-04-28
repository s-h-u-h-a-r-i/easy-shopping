import { Bug } from 'lucide-solid';
import { createSignal, For } from 'solid-js';

import Select from '../ui/select';
import * as styles from './DevPanel.css';
import { MOCK_USERS, NetworkMode, scenario, setScenario } from './scenario';

const NETWORK_MODES: NetworkMode[] = ['success', 'error', 'slow'];

const DevPanel = () => {
  const [open, setOpen] = createSignal(false);

  return (
    <div class={styles.root}>
      {open() && (
        <div class={styles.panel}>
          <Select
            label="User"
            value={scenario.auth.user?.id ?? ''}
            onChange={(e) => {
              const user = MOCK_USERS.find((u) => u.id === e.target.value) ?? null;
              setScenario('auth', 'user', user);
            }}
          >
            <option value="">Signed out</option>
            <For each={MOCK_USERS}>
              {(user) => <option value={user.id}>{user.name}</option>}
            </For>
          </Select>

          <Select
            label="Network"
            value={scenario.network}
            onChange={(e) => setScenario('network', e.target.value as NetworkMode)}
          >
            <For each={NETWORK_MODES}>
              {(mode) => <option value={mode}>{mode}</option>}
            </For>
          </Select>
        </div>
      )}

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
