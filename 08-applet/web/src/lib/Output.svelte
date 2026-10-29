<script>
  import { applet, remember } from "./state.svelte.js";
  import { PROBES } from "./probes.js";
  import { CURVES } from "./taps.js";
  import { takeToCSV, takeToMIDI, download } from "./take.js";

  const MESSAGES = {
    off: "MIDI is off.",
    unsupported: "This browser has no Web MIDI. Readings, controls, and the loop still run.",
    denied: "MIDI permission was denied. The loop still runs.",
    noports: "No MIDI output port exists. The taps keep their CC numbers.",
    choose: "Choose an output port.",
    lost: "The port disconnected. Sending stopped. The taps stay.",
    ready: "",
  };

  function setCC(k, event) {
    const n = Number(event.currentTarget.value);
    if (!Number.isInteger(n) || n < 0 || n > 127 || !applet.editTap(k, { cc: n })) {
      event.currentTarget.value = String(applet.taps[k].cc);
    }
  }

  function stamp() {
    const t = applet.lastTake;
    return `take-${t.meta.seed}-${t.frames[0]?.tick ?? 0}`;
  }
</script>

<aside aria-label="Output">
  <h2>Output</h2>

  {#if applet.output.status === "off" || applet.output.status === "denied"}
    <button type="button" onclick={() => applet.enableMidi()}>
      {applet.output.status === "off" ? "Enable MIDI" : "Ask again"}
    </button>
  {/if}
  {#if MESSAGES[applet.output.status]}
    <p class="note" class:warn={applet.output.status === "lost"}>{MESSAGES[applet.output.status]}</p>
  {/if}

  {#if applet.output.ports.length}
    <label>
      <span class="id">port</span>
      <select value={applet.output.portId} onchange={(e) => applet.choosePort(e.currentTarget.value)}>
        <option value="">None</option>
        {#each applet.output.ports as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
      </select>
    </label>
  {/if}

  <label>
    <span class="id">channel</span>
    <select bind:value={applet.output.channel} onchange={() => remember("channel", applet.output.channel)}>
      {#each Array.from({ length: 16 }, (_, i) => i + 1) as ch}<option value={ch}>{ch}</option>{/each}
    </select>
  </label>

  <h2>Taps</h2>
  {#each applet.taps as tap, k (tap)}
    <div class="tap">
      <select value={tap.probe} onchange={(e) => applet.editTap(k, { probe: e.currentTarget.value })}
              aria-label="Probe">
        {#each PROBES as p (p.id)}<option value={p.id}>{p.id}</option>{/each}
      </select>
      <div class="tap-row">
        <select value={tap.curve} onchange={(e) => applet.editTap(k, { curve: e.currentTarget.value })}
                aria-label="Curve">
          {#each Object.keys(CURVES) as c}<option value={c}>{c}</option>{/each}
        </select>
        <label class="cc">CC <input type="number" min="0" max="127" value={tap.cc} onchange={(e) => setCC(k, e)} /></label>
        <span class="value" title="The CC value on the last tick">{applet.tapValues[tap.cc] ?? "–"}</span>
        <button type="button" aria-label="Remove tap" onclick={() => applet.removeTap(k)}>×</button>
      </div>
    </div>
  {/each}
  <button type="button" onclick={() => applet.addTap()}>+ add tap</button>

  <h2>Take</h2>
  {#if applet.take}
    <button type="button" onclick={() => applet.stopTake()}>Stop ({applet.takeTicks} ticks)</button>
  {:else}
    <button type="button" onclick={() => applet.startTake()}>Record</button>
  {/if}
  {#if applet.lastTake && !applet.take}
    <div class="buttons">
      <button type="button" disabled={!applet.lastTake.frames.length}
              onclick={() => download(`${stamp()}.csv`, takeToCSV(applet.lastTake), "text/csv")}>Save .csv</button>
      <button type="button" disabled={!applet.lastTake.frames.length || !applet.lastTake.meta.taps.length}
              onclick={() => download(`${stamp()}.mid`, takeToMIDI(applet.lastTake), "audio/midi")}>Save .mid</button>
    </div>
    <p class="note">{applet.lastTake.frames.length} ticks recorded. A take stays on this machine.</p>
  {/if}
</aside>

<style>
  aside {
    width: 240px; flex-shrink: 0; background: var(--panel); border: 1px solid var(--line);
    padding: 12px; display: flex; flex-direction: column; gap: 8px;
  }
  h2 { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
  h2:not(:first-child) { margin-top: 6px; }
  label { display: flex; flex-direction: column; gap: 2px; }
  .id { font-family: ui-monospace, monospace; font-size: 12px; }
  select { width: 100%; }
  .tap { display: flex; flex-direction: column; gap: 4px; padding-bottom: 6px; border-bottom: 1px solid var(--line); }
  .tap-row { display: flex; gap: 6px; align-items: center; }
  .tap-row select { width: auto; flex: 1; }
  .cc { flex-direction: row; align-items: center; gap: 4px; font-size: 12px; }
  .cc input { width: 3.5em; }
  .value { min-width: 2.2em; text-align: right; font-variant-numeric: tabular-nums; color: var(--muted); }
  .buttons { display: flex; gap: 6px; }
  .note { margin: 0; color: var(--muted); font-size: 12px; }
  .warn { color: var(--error); }
  @media (max-width: 640px) {
    aside { width: 100%; }
  }
</style>
