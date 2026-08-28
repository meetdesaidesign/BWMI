/** Client-side privacy pass for story photos: blur faces and number plates. */

export type PrivacyBox = { x: number; y: number; width: number; height: number };

type FaceDetectorCtor = new (options?: { fastMode?: boolean }) => {
  detect: (image: ImageBitmapSource) => Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
};

function isPlateColor(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const white = r > 168 && g > 168 && b > 150 && max - min < 58;
  const yellow = r > 168 && g > 148 && b < 130 && r > b + 36;
  return white || yellow;
}

function isSkin(r: number, g: number, b: number) {
  return r > 95 && g > 40 && b > 20 && r > g && r > b && r - g > 12 && Math.max(r, g, b) - Math.min(r, g, b) > 15;
}

function floodBoxes(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  match: (r: number, g: number, b: number) => boolean,
): PrivacyBox[] {
  const seen = new Uint8Array(width * height);
  const boxes: PrivacyBox[] = [];

  const visit = (start: number) => {
    const stack = [start];
    seen[start] = 1;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let count = 0;
    while (stack.length) {
      const i = stack.pop()!;
      const x = i % width;
      const y = (i / width) | 0;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      count += 1;
      if (x > 0 && !seen[i - 1]) {
        const n = i - 1;
        const nr = data[n * 4];
        const ng = data[n * 4 + 1];
        const nb = data[n * 4 + 2];
        if (match(nr, ng, nb)) { seen[n] = 1; stack.push(n); }
      }
      if (x + 1 < width && !seen[i + 1]) {
        const n = i + 1;
        const nr = data[n * 4];
        const ng = data[n * 4 + 1];
        const nb = data[n * 4 + 2];
        if (match(nr, ng, nb)) { seen[n] = 1; stack.push(n); }
      }
      if (y > 0 && !seen[i - width]) {
        const n = i - width;
        const nr = data[n * 4];
        const ng = data[n * 4 + 1];
        const nb = data[n * 4 + 2];
        if (match(nr, ng, nb)) { seen[n] = 1; stack.push(n); }
      }
      if (y + 1 < height && !seen[i + width]) {
        const n = i + width;
        const nr = data[n * 4];
        const ng = data[n * 4 + 1];
        const nb = data[n * 4 + 2];
        if (match(nr, ng, nb)) { seen[n] = 1; stack.push(n); }
      }
    }
    return { minX, minY, maxX, maxY, count };
  };

  for (let i = 0; i < width * height; i += 1) {
    if (seen[i]) continue;
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    if (!match(r, g, b)) continue;
    const blob = visit(i);
    if (blob.count < 40) continue;
    boxes.push({
      x: blob.minX,
      y: blob.minY,
      width: blob.maxX - blob.minX + 1,
      height: blob.maxY - blob.minY + 1,
    });
  }
  return boxes;
}

function contrastScore(data: Uint8ClampedArray, width: number, box: PrivacyBox) {
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  const x1 = Math.max(0, Math.floor(box.x));
  const y1 = Math.max(0, Math.floor(box.y));
  const x2 = Math.min(width, Math.ceil(box.x + box.width));
  const y2 = Math.min(data.length / 4 / width, Math.ceil(box.y + box.height));
  for (let y = y1; y < y2; y += 2) {
    for (let x = x1; x < x2; x += 2) {
      const i = (y * width + x) * 4;
      const luma = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      sum += luma;
      sumSq += luma * luma;
      n += 1;
    }
  }
  if (n < 8) return 0;
  const mean = sum / n;
  return Math.sqrt(Math.max(0, sumSq / n - mean * mean));
}

function padBox(box: PrivacyBox, imageW: number, imageH: number, ratio: number): PrivacyBox {
  const padX = box.width * ratio;
  const padY = box.height * ratio;
  const x = Math.max(0, box.x - padX);
  const y = Math.max(0, box.y - padY);
  return {
    x,
    y,
    width: Math.min(imageW - x, box.width + padX * 2),
    height: Math.min(imageH - y, box.height + padY * 2),
  };
}

async function detectFaces(image: HTMLCanvasElement): Promise<PrivacyBox[]> {
  const Detector = (window as unknown as { FaceDetector?: FaceDetectorCtor }).FaceDetector;
  if (typeof Detector === "function") {
    try {
      const faces = await new Detector({ fastMode: true }).detect(image);
      return faces.map((face) => ({
        x: face.boundingBox.x,
        y: face.boundingBox.y,
        width: face.boundingBox.width,
        height: face.boundingBox.height,
      }));
    } catch {
      /* Fall through to colour clustering when the detector is unavailable. */
    }
  }

  const ctx = image.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  const sampleW = 160;
  const sampleH = Math.max(1, Math.round((image.height / image.width) * sampleW));
  const sample = document.createElement("canvas");
  sample.width = sampleW;
  sample.height = sampleH;
  const sampleCtx = sample.getContext("2d");
  if (!sampleCtx) return [];
  sampleCtx.drawImage(image, 0, 0, sampleW, sampleH);
  const pixels = sampleCtx.getImageData(0, 0, sampleW, sampleH);
  const scaleX = image.width / sampleW;
  const scaleY = image.height / sampleH;
  return floodBoxes(pixels.data, sampleW, sampleH, isSkin)
    .filter((box) => {
      const aspect = box.width / Math.max(1, box.height);
      const size = Math.max(box.width * scaleX, box.height * scaleY);
      return aspect > 0.55 && aspect < 1.45 && size > image.width * 0.04 && size < image.width * 0.22;
    })
    .map((box) => ({
      x: box.x * scaleX,
      y: box.y * scaleY,
      width: box.width * scaleX,
      height: box.height * scaleY,
    }));
}

function detectPlates(image: HTMLCanvasElement): PrivacyBox[] {
  const ctx = image.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  const sampleW = 280;
  const sampleH = Math.max(1, Math.round((image.height / image.width) * sampleW));
  const sample = document.createElement("canvas");
  sample.width = sampleW;
  sample.height = sampleH;
  const sampleCtx = sample.getContext("2d");
  if (!sampleCtx) return [];
  sampleCtx.drawImage(image, 0, 0, sampleW, sampleH);
  const pixels = sampleCtx.getImageData(0, 0, sampleW, sampleH);
  const scaleX = image.width / sampleW;
  const scaleY = image.height / sampleH;
  return floodBoxes(pixels.data, sampleW, sampleH, isPlateColor)
    .filter((box) => {
      const aspect = box.width / Math.max(1, box.height);
      const width = box.width * scaleX;
      const height = box.height * scaleY;
      if (aspect < 1.7 || aspect > 6.2) return false;
      if (width < image.width * 0.035 || width > image.width * 0.32) return false;
      if (height < image.height * 0.012 || height > image.height * 0.14) return false;
      return contrastScore(pixels.data, sampleW, box) > 26;
    })
    .map((box) => ({
      x: box.x * scaleX,
      y: box.y * scaleY,
      width: box.width * scaleX,
      height: box.height * scaleY,
    }));
}

function blurBox(ctx: CanvasRenderingContext2D, source: HTMLCanvasElement, box: PrivacyBox, radius: number) {
  const pad = radius * 2;
  const sx = Math.max(0, Math.floor(box.x - pad));
  const sy = Math.max(0, Math.floor(box.y - pad));
  const sw = Math.min(source.width - sx, Math.ceil(box.width + pad * 2));
  const sh = Math.min(source.height - sy, Math.ceil(box.height + pad * 2));
  if (sw < 2 || sh < 2) return;

  const tmp = document.createElement("canvas");
  tmp.width = sw;
  tmp.height = sh;
  const tmpCtx = tmp.getContext("2d");
  if (!tmpCtx) return;
  tmpCtx.filter = `blur(${radius}px)`;
  tmpCtx.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.width, box.height, Math.min(box.height, box.width) * 0.18);
  ctx.clip();
  ctx.drawImage(tmp, sx, sy);
  ctx.restore();
}

export async function privacyProtect(image: CanvasImageSource, width: number, height: number): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.drawImage(image, 0, 0, width, height);

  const faces = await detectFaces(canvas);
  const plates = detectPlates(canvas);
  const regions = [
    ...faces.map((box) => padBox(box, width, height, 0.28)),
    ...plates.map((box) => padBox(box, width, height, 0.22)),
  ];
  const radius = Math.max(10, Math.round(Math.min(width, height) * 0.028));
  for (const box of regions) blurBox(ctx, canvas, box, radius);
  return canvas;
}
