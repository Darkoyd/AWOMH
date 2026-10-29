<script>
  import { applet } from "./lib/state.svelte.js";
  import Stage from "./lib/Stage.svelte";
  import DebugPanel from "./lib/DebugPanel.svelte";

  // Number keys 1..9 select an image, so the toggle needs no pointer.
  function onkeydown(event) {
    if (!applet.debug || event.target.closest("input, select, button")) return;
    const k = Number(event.key) - 1;
    if (k >= 0 && k < applet.images.length) applet.current = k;
  }
</script>

<svelte:window {onkeydown} />

<main>
  <Stage />
  {#if applet.debug}
    <DebugPanel />
  {/if}
</main>

<button
  class="debug-toggle"
  type="button"
  aria-pressed={applet.debug}
  onclick={() => (applet.debug = !applet.debug)}
>debug</button>

<style>
  main { display: flex; gap: 16px; padding: 16px; align-items: flex-start; min-height: 100vh; }
  .debug-toggle {
    position: fixed; right: 10px; bottom: 10px; font: inherit; font-size: 11px; color: var(--muted);
    background: transparent; border: 1px solid var(--line); border-radius: 3px; padding: 2px 6px;
    cursor: pointer;
  }
  .debug-toggle[aria-pressed="true"] { color: var(--fg); }
  @media (max-width: 640px) {
    main { flex-direction: column; }
  }
</style>
