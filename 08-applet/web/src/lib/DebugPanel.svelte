<script>
  import { applet, remember } from "./state.svelte.js";
  import { extractPreview } from "./cr3.js";
  import { makeBuffer } from "./buffer.js";

  async function decode(file) {
    if (/\.cr3$/i.test(file.name)) {
      const jpeg = extractPreview(await file.arrayBuffer());
      return createImageBitmap(new Blob([jpeg], { type: "image/jpeg" }));
    }
    return createImageBitmap(file);
  }

  async function load(event) {
    // currentTarget is null once the event finishes dispatching, which happens at the first await.
    const input = event.currentTarget;
    const files = [...input.files];
    const added = [];
    const failed = [];
    for (const file of files) {
      try {
        const bitmap = await decode(file);
        added.push({ name: file.name, bitmap, buffer: makeBuffer(bitmap, applet.turns, applet.longEdge) });
      } catch (err) {
        failed.push(`${file.name}: ${err.message || err}`);
      }
    }
    input.value = "";
    applet.images = [...applet.images, ...added];
    if (applet.current < 0 && applet.images.length) {
      applet.current = 0;
      applet.restart();
    }
    applet.statusError = failed.length > 0;
    applet.status = failed.length ? `Not loaded. ${failed.join(" | ")}` : `${applet.images.length} images loaded.`;
  }

  function clear() {
    for (const img of applet.images) img.bitmap.close();
    applet.images = [];
    applet.current = -1;
    applet.loop.playing = false;
    applet.restart();
    applet.status = "";
  }

  // Every buffer derives from its decoded source, so a new setting rebuilds them all.
  function rebuild() {
    applet.images = applet.images.map((img) => ({
      ...img,
      buffer: makeBuffer(img.bitmap, applet.turns, applet.longEdge),
    }));
    applet.restart();
  }

  function setTurns(event) {
    applet.turns = Number(event.currentTarget.value);
    remember("turns", applet.turns);
    rebuild();
  }

  function setLongEdge(event) {
    applet.longEdge = Number(event.currentTarget.value);
    remember("longEdge", applet.longEdge);
    rebuild();
  }
</script>

<aside aria-label="Debug mode">
  <h2>Debug mode</h2>

  <fieldset>
    <legend>Test sources</legend>
    <input type="file" multiple accept=".jpg,.jpeg,.png,.cr3,.CR3,image/jpeg,image/png" onchange={load} />
    <button type="button" onclick={clear}>Remove all</button>
  </fieldset>

  <fieldset>
    <legend>Shown (keys 1–9)</legend>
    {#each applet.images as img, k (k)}
      <label>
        <input type="radio" name="image" checked={k === applet.current} onchange={() => applet.show(k)} />
        {img.name}
      </label>
    {/each}
  </fieldset>

  <fieldset>
    <legend>Rotation</legend>
    <select value={String(applet.turns)} onchange={setTurns}>
      <option value="0">None</option>
      <option value="1">90° clockwise</option>
      <option value="2">180°</option>
      <option value="3">90° counterclockwise</option>
    </select>
  </fieldset>

  <fieldset>
    <legend>Buffer size, long edge</legend>
    <select value={String(applet.longEdge)} onchange={setLongEdge}>
      <option value="256">256 px</option>
      <option value="512">512 px</option>
      <option value="1024">1024 px</option>
      <option value="0">Source size</option>
    </select>
  </fieldset>

  <p class="status" class:error={applet.statusError} role="status">{applet.status}</p>
</aside>

<style>
  aside {
    width: 280px; flex-shrink: 0; background: var(--panel); border: 1px solid var(--line);
    padding: 12px; display: flex; flex-direction: column; gap: 12px;
  }
  h2 { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
  fieldset { border: 0; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
  legend { color: var(--muted); padding: 0; margin-bottom: 4px; }
  label { overflow-wrap: anywhere; }
  .status { min-height: 1.4em; margin: 0; color: var(--muted); }
  .status.error { color: var(--error); }
  @media (max-width: 640px) {
    aside { width: 100%; }
  }
</style>
