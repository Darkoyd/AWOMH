// The buffer (§3.2): a Float32Array of width * height * 3 values in 0..1, RGB only. It takes the aspect
// of the image it holds. It converts to ImageData only to draw, and is never stored as one.

function scratch(width, height) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(width, height);
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  return c;
}

// Scale `bitmap` once into a new buffer. `turns` is the number of quarter turns clockwise (0..3).
// `longEdge` sets the size of the longer side in pixels, or 0 for the source's own size.
export function makeBuffer(bitmap, turns, longEdge) {
  const sideways = turns % 2 === 1;
  const srcW = sideways ? bitmap.height : bitmap.width;
  const srcH = sideways ? bitmap.width : bitmap.height;
  const scale = longEdge > 0 ? longEdge / Math.max(srcW, srcH) : 1;
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));

  const canvas = scratch(width, height);
  const ctx = canvas.getContext("2d");
  ctx.translate(width / 2, height / 2);
  ctx.rotate(turns * Math.PI / 2);
  const drawW = (sideways ? height : width);
  const drawH = (sideways ? width : height);
  ctx.drawImage(bitmap, -drawW / 2, -drawH / 2, drawW, drawH);

  const rgba = ctx.getImageData(0, 0, width, height).data;
  const data = new Float32Array(width * height * 3);
  for (let p = 0, q = 0; p < rgba.length; p += 4, q += 3) {
    data[q] = rgba[p] / 255;
    data[q + 1] = rgba[p + 1] / 255;
    data[q + 2] = rgba[p + 2] / 255;
  }
  return { width, height, data };
}

// Draw a buffer to a visible canvas.
export function drawBuffer(buffer, canvas) {
  const { width, height, data } = buffer;
  canvas.width = width;
  canvas.height = height;
  const image = new ImageData(width, height);
  const out = image.data;
  for (let p = 0, q = 0; q < data.length; p += 4, q += 3) {
    out[p] = Math.round(data[q] * 255);
    out[p + 1] = Math.round(data[q + 1] * 255);
    out[p + 2] = Math.round(data[q + 2] * 255);
    out[p + 3] = 255;
  }
  canvas.getContext("2d").putImageData(image, 0, 0);
}
