import { createSignal, onCleanup, onMount, Show } from 'solid-js';

import * as styles from './DevPanel.css';

const DEV_PANEL_HOTKEY = 'd';

const DevPanel = () => {
  const [open, setOpen] = createSignal(false);

  onMount(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (isTypingContext(e.target)) return;
      if (!e.altKey || !e.shiftKey) return;
      if (e.key.toLowerCase() !== DEV_PANEL_HOTKEY) return;

      e.preventDefault();
      setOpen((o) => !o);
    };

    document.addEventListener('keydown', onKeyDown);
    console.info(`[mock] Dev panel: Alt+Shift+${DEV_PANEL_HOTKEY.toUpperCase()}`);
    onCleanup(() => document.removeEventListener('keydown', onKeyDown));
  });

  return (
    <div class={styles.root}>
      <Show when={open()} children={<div class={styles.panel} />} />
    </div>
  );
};

export default DevPanel;

function isTypingContext(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const t = target.tagName;
  return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT';
}
