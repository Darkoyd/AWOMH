<script>
  import { applet } from "./state.svelte.js";
  import { drawBuffer } from "./buffer.js";
  import ProbeTable from "./ProbeTable.svelte";

  let canvas = $state();
  const image = $derived(applet.debug ? applet.images[applet.current] : undefined);

  // The canvas draws the buffer, never the moment (§3.3).
  $effect(() => {
    if (canvas && image) drawBuffer(image.buffer, canvas);
  });
</script>

<section>
  {#if !applet.debug}
    <p class="note">No moment is published yet.</p>
  {:else if !image}
    <p class="note">Load two or more images in the debug panel.</p>
  {:else}
    <canvas bind:this={canvas}></canvas>
    <span class="dims">{image.buffer.width} × {image.buffer.height}</span>
    <ProbeTable />
  {/if}
</section>

<style>
  section { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; }
  canvas { max-width: 100%; max-height: 70vh; border: 1px solid var(--line); }
  .note { color: var(--muted); margin-top: 20vh; text-align: center; }
  .dims { color: var(--muted); font-variant-numeric: tabular-nums; }
</style>
