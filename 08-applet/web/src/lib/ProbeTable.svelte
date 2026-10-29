<script>
  import { applet } from "./state.svelte.js";
  import { PROBES, computeProbes } from "./probes.js";

  // One column per loaded image. Before the loop exists, every buffer is its image with the same
  // controls applied and no noise, so every column is read from the same kind of source.
  const columns = $derived(
    applet.views.map((view) => {
      try {
        return { values: computeProbes(view), error: null };
      } catch (err) {
        return { values: null, error: err.message };
      }
    }),
  );

  // Spread across the loaded images, as a share of the declared range. With two captures of an
  // unchanged wall, this is the framing noise of each probe.
  function spread(p) {
    const vs = columns.filter((c) => c.values).map((c) => c.values[p.id]);
    if (vs.length < 2) return null;
    return (Math.max(...vs) - Math.min(...vs)) / (p.hi - p.lo);
  }

  const spreads = $derived(Object.fromEntries(PROBES.map((p) => [p.id, spread(p)])));

  // The loop's buffer, read after the blend: step 4 of the tick (§3.3).
  const live = $derived(applet.liveProbes);

  const fmt = (v) => v.toFixed(3);
  const pct = (v) => `${(v * 100).toFixed(1)}%`;
  const errors = $derived([
    ...(live?.error ? [`live: ${live.error}`] : []),
    ...columns.flatMap((c, k) => (c.error ? [`${applet.images[k].name}: ${c.error}`] : [])),
  ]);
</script>

{#if errors.length}
  <div class="errors" role="alert">
    {#each errors as e}<p>{e}</p>{/each}
  </div>
{/if}

<div class="wrap">
  <table>
    <thead>
      <tr>
        <th scope="col">Probe</th>
        <th scope="col">Range</th>
        <th scope="col" class="num live" title="The loop's buffer, tick by tick">Live</th>
        {#each applet.images as img, k}
          <th scope="col" class="num" class:current={k === applet.current} title={img.name}>{k + 1}</th>
        {/each}
        <th scope="col" class="num" title="(max − min) / range, across the loaded images">Spread</th>
      </tr>
    </thead>
    <tbody>
      {#each PROBES as p, i}
        {#if i === 0 || PROBES[i - 1].group !== p.group}
          <tr class="group"><th colspan={applet.images.length + 4} scope="rowgroup">{p.group}</th></tr>
        {/if}
        <tr>
          <th scope="row" title={p.meaning}>{p.id}</th>
          <td class="range">{p.lo} – {p.hi}</td>
          <td class="num live" class:bad={live && !live.values}>
            {live?.values ? fmt(live.values[p.id]) : live ? "error" : "–"}
          </td>
          {#each columns as col, k}
            <td class="num" class:current={k === applet.current} class:bad={!col.values}>
              {col.values ? fmt(col.values[p.id]) : "error"}
            </td>
          {/each}
          <td class="num spread">{spreads[p.id] === null ? "–" : pct(spreads[p.id])}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .wrap { width: 100%; overflow-x: auto; }
  table { border-collapse: collapse; margin: 0 auto; font-variant-numeric: tabular-nums; }
  th, td { padding: 2px 10px; text-align: left; border-bottom: 1px solid var(--line); white-space: nowrap; }
  thead th { color: var(--muted); font-weight: normal; }
  tbody th { font-weight: normal; font-family: ui-monospace, monospace; font-size: 12px; }
  .group th { color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; padding-top: 10px; }
  .num { text-align: right; }
  .live { font-weight: 600; border-right: 1px solid var(--line); }
  .range, .spread { color: var(--muted); }
  .current { background: var(--panel); color: var(--fg); font-weight: 600; }
  .bad { color: var(--error); }
  .errors { color: var(--error); border: 1px solid var(--error); padding: 4px 10px; }
  .errors p { margin: 2px 0; }
</style>
