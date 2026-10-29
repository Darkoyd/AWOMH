<script>
  import { applet, remember } from "./state.svelte.js";
  import { RATE_MIN, RATE_MAX, newSeed } from "./loop.js";
  import { AMOUNT_MAX } from "./noise.js";

  // The clock (§3.4): a fixed tick rate from an accumulator, not one tick per animation frame. When the
  // page falls behind, it drops wall time and never skips a tick, so a run stays repeatable.
  const MAX_TICKS_PER_FRAME = 4;
  $effect(() => {
    if (!applet.loop.playing) return;
    let last = performance.now(), acc = 0, raf;
    const frame = (now) => {
      acc += now - last;
      last = now;
      const dt = 1000 / applet.loop.rate;
      let n = 0;
      while (acc >= dt && n < MAX_TICKS_PER_FRAME) {
        applet.step();
        acc -= dt;
        n++;
      }
      if (n === MAX_TICKS_PER_FRAME) acc = 0;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  });

  function setSeed(event) {
    const v = Number(event.currentTarget.value);
    if (Number.isInteger(v) && v >= 0 && v <= 0xffffffff) {
      applet.loop.seed = v;
      applet.restart();
    } else {
      event.currentTarget.value = String(applet.loop.seed);
    }
  }
</script>

<aside aria-label="Loop">
  <h2>Loop</h2>

  <div class="buttons">
    <button type="button" onclick={() => (applet.loop.playing = !applet.loop.playing)}>
      {applet.loop.playing ? "Pause" : "Play"}
    </button>
    <button type="button" disabled={applet.loop.playing} onclick={() => applet.step()}>Step</button>
    <button type="button" onclick={() => applet.restart()}>Restart</button>
    <span class="tick" title="Tick count since the last restart">t = {applet.loop.tick}</span>
  </div>

  <label>
    <span class="row"><span class="id">seed</span></span>
    <span class="seed">
      <input type="number" min="0" max="4294967295" step="1" value={applet.loop.seed} onchange={setSeed} />
      <button type="button" onclick={() => { applet.loop.seed = newSeed(); applet.restart(); }}>New</button>
    </span>
  </label>

  <label>
    <span class="row"><span class="id">rate</span><span class="value">{applet.loop.rate} Hz</span></span>
    <input type="range" min={RATE_MIN} max={RATE_MAX} step="1" bind:value={applet.loop.rate}
           onchange={() => remember("rate", applet.loop.rate)} />
  </label>

  <label>
    <span class="row"><span class="id">leak</span><span class="value">{applet.loop.leak.toFixed(2)}</span></span>
    <input type="range" min="0" max="1" step="0.01" bind:value={applet.loop.leak}
           title="The pull back toward the image on every tick. 0 is pure feedback, 1 is no feedback." />
  </label>

  <h2>Perturbation</h2>

  <label>
    <span class="row"><span class="id">character</span></span>
    <select bind:value={applet.noise.character}>
      <option value="white">White, per pixel</option>
      <option value="value">Value noise at a scale</option>
      <option value="drift">Drifting field</option>
    </select>
  </label>

  <label>
    <span class="row"><span class="id">channels</span></span>
    <select bind:value={applet.noise.channels}>
      <option value="independent">Independent per channel</option>
      <option value="shared">One shared field</option>
    </select>
  </label>

  <label>
    <span class="row"><span class="id">amount</span><span class="value">{applet.noise.amount.toFixed(3)}</span></span>
    <input type="range" min="0" max={AMOUNT_MAX} step="0.005" bind:value={applet.noise.amount} />
  </label>

  {#if applet.noise.character !== "white"}
    <label>
      <span class="row"><span class="id">scale</span><span class="value">{applet.noise.scale} px</span></span>
      <input type="range" min="1" max="64" step="1" bind:value={applet.noise.scale} />
    </label>
  {/if}

  {#if applet.noise.character === "drift"}
    <label>
      <span class="row"><span class="id">period</span><span class="value">{applet.noise.period} ticks</span></span>
      <input type="range" min="1" max="300" step="1" bind:value={applet.noise.period} />
    </label>
  {/if}

  <label class="check">
    <input type="checkbox" bind:checked={applet.loop.restartOnToggle} />
    Restart when the shown image changes
  </label>

  <p class="note">The same seed and the same settings repeat a run from Restart.</p>
</aside>

<style>
  aside {
    width: 240px; flex-shrink: 0; background: var(--panel); border: 1px solid var(--line);
    padding: 12px; display: flex; flex-direction: column; gap: 8px;
  }
  h2 { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
  h2:not(:first-child) { margin-top: 6px; }
  label { display: flex; flex-direction: column; gap: 2px; }
  label.check { flex-direction: row; align-items: center; gap: 6px; }
  .row { display: flex; justify-content: space-between; gap: 8px; }
  .id { font-family: ui-monospace, monospace; font-size: 12px; }
  .value, .tick { color: var(--muted); font-variant-numeric: tabular-nums; }
  .buttons { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
  .tick { margin-left: auto; }
  .seed { display: flex; gap: 6px; }
  .seed input { flex: 1; min-width: 0; font-variant-numeric: tabular-nums; }
  input[type="range"], select { width: 100%; }
  .note { margin: 0; color: var(--muted); font-size: 12px; }
  @media (max-width: 640px) {
    aside { width: 100%; }
  }
</style>
