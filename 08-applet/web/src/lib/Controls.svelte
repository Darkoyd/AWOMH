<script>
  import { applet } from "./state.svelte.js";
  import { CONTROLS, identityValues } from "./controls.js";

  const touched = $derived(CONTROLS.some((c) => applet.controls[c.id] !== c.identity));
  const fmt = (c, v) => (c.step >= 1 ? String(v) : v.toFixed(c.step >= 0.1 ? 1 : 2));
</script>

<aside aria-label="Controls">
  <h2>Controls</h2>
  {#each CONTROLS as c (c.id)}
    <label>
      <span class="row">
        <span class="id">{c.id}</span>
        <span class="value" class:moved={applet.controls[c.id] !== c.identity}>
          {fmt(c, applet.controls[c.id])}{c.unit ? ` ${c.unit}` : ""}
        </span>
      </span>
      <input
        type="range"
        min={c.lo}
        max={c.hi}
        step={c.step}
        bind:value={applet.controls[c.id]}
        ondblclick={() => (applet.controls[c.id] = c.identity)}
        title="{c.kind}. Double-click to reset."
      />
    </label>
  {/each}
  <button type="button" disabled={!touched} onclick={() => (applet.controls = identityValues())}>Reset all</button>
  <p class="note">Equilibrium controls settle at a steady state. Rate controls keep moving. Both act on every tick.</p>
</aside>

<style>
  aside {
    width: 240px; flex-shrink: 0; background: var(--panel); border: 1px solid var(--line);
    padding: 12px; display: flex; flex-direction: column; gap: 8px;
  }
  h2 { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
  label { display: flex; flex-direction: column; gap: 2px; }
  .row { display: flex; justify-content: space-between; gap: 8px; }
  .id { font-family: ui-monospace, monospace; font-size: 12px; }
  .value { color: var(--muted); font-variant-numeric: tabular-nums; }
  .value.moved { color: var(--fg); font-weight: 600; }
  input[type="range"] { width: 100%; }
  .note { margin: 0; color: var(--muted); font-size: 12px; }
  @media (max-width: 640px) {
    aside { width: 100%; }
  }
</style>
