import { readFile } from "fs/promises";
import path from "path";
import { PNG } from "pngjs";
import QRCode from "qrcode";

const BLACK = { r: 0, g: 0, b: 0 };
const RED = { r: 204, g: 0, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

function isFinderCell(row: number, col: number, size: number) {
  return (
    (row < 7 && col < 7) ||
    (row < 7 && col >= size - 7) ||
    (row >= size - 7 && col < 7)
  );
}

function setPixel(
  png: PNG,
  x: number,
  y: number,
  color: { r: number; g: number; b: number },
  alpha = 255,
) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
  png.data[idx] = color.r;
  png.data[idx + 1] = color.g;
  png.data[idx + 2] = color.b;
  png.data[idx + 3] = alpha;
}

function fillRect(
  png: PNG,
  x: number,
  y: number,
  w: number,
  h: number,
  color: { r: number; g: number; b: number },
) {
  const x2 = Math.min(png.width, x + w);
  const y2 = Math.min(png.height, y + h);
  for (let py = Math.max(0, y); py < y2; py++) {
    for (let px = Math.max(0, x); px < x2; px++) {
      setPixel(png, px, py, color);
    }
  }
}

function blitScaled(dest: PNG, src: PNG, dx: number, dy: number, size: number) {
  for (let y = 0; y < size; y++) {
    const sy = Math.min(src.height - 1, Math.floor((y * src.height) / size));
    for (let x = 0; x < size; x++) {
      const sx = Math.min(src.width - 1, Math.floor((x * src.width) / size));
      const sIdx = (src.width * sy + sx) << 2;
      const alpha = src.data[sIdx + 3] / 255;
      if (alpha === 0) continue;
      const px = dx + x;
      const py = dy + y;
      if (px < 0 || py < 0 || px >= dest.width || py >= dest.height) continue;
      const dIdx = (dest.width * py + px) << 2;
      dest.data[dIdx] = Math.round(
        src.data[sIdx] * alpha + dest.data[dIdx] * (1 - alpha),
      );
      dest.data[dIdx + 1] = Math.round(
        src.data[sIdx + 1] * alpha + dest.data[dIdx + 1] * (1 - alpha),
      );
      dest.data[dIdx + 2] = Math.round(
        src.data[sIdx + 2] * alpha + dest.data[dIdx + 2] * (1 - alpha),
      );
      dest.data[dIdx + 3] = 255;
    }
  }
}

export async function createRegistrationQrPng(url: string, size = 1024) {
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const modules = qr.modules;
  const moduleCount = modules.size;
  const marginModules = 2;
  const totalModules = moduleCount + marginModules * 2;
  const cell = Math.floor(size / totalModules);
  const canvas = cell * totalModules;
  const png = new PNG({ width: canvas, height: canvas });

  fillRect(png, 0, 0, canvas, canvas, WHITE);

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!modules.get(row, col)) continue;
      const color = isFinderCell(row, col, moduleCount) ? RED : BLACK;
      fillRect(
        png,
        (col + marginModules) * cell,
        (row + marginModules) * cell,
        cell,
        cell,
        color,
      );
    }
  }

  const logoPath = path.join(process.cwd(), "public", "nrg-logo.png");
  const logo = PNG.sync.read(await readFile(logoPath));
  const logoSize = Math.round(canvas * 0.24);
  const pad = Math.round(cell * 1.2);
  const dx = Math.round((canvas - logoSize) / 2);
  const dy = Math.round((canvas - logoSize) / 2);

  fillRect(
    png,
    dx - pad,
    dy - pad,
    logoSize + pad * 2,
    logoSize + pad * 2,
    WHITE,
  );
  blitScaled(png, logo, dx, dy, logoSize);

  return PNG.sync.write(png);
}

export async function createRegistrationQrDataUrl(url: string) {
  const png = await createRegistrationQrPng(url);
  return `data:image/png;base64,${png.toString("base64")}`;
}
