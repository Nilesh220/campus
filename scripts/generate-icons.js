// Script to generate valid standalone PNG icons for PWA
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, colorHex, iconChar = '✨') {
  // Simple uncompressed PNG generator
  // RGB hex
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);

  // Raw RGBA pixel buffer
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Draw rounded icon badge with gradient
      const gradient = 1 - (y / height) * 0.25;
      let pr = Math.min(255, Math.floor(r * gradient));
      let pg = Math.min(255, Math.floor(g * gradient));
      let pb = Math.min(255, Math.floor(b * gradient));
      let pa = 255;

      // Draw spark diamond in center
      const sparkDist = Math.abs(dx) + Math.abs(dy);
      if (sparkDist < width * 0.22) {
        pr = 255;
        pg = 255;
        pb = 255;
      } else if (dist > radius) {
        // Soft rounded corners
        const cornerDist = Math.max(Math.abs(dx) - (width * 0.38), 0)**2 + Math.max(Math.abs(dy) - (height * 0.38), 0)**2;
        if (cornerDist > (width * 0.08)**2) {
          pa = 0;
        }
      }

      rawData[offset++] = pr;
      rawData[offset++] = pg;
      rawData[offset++] = pb;
      rawData[offset++] = pa;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeInt32BE(crc, 8 + len);
  return buf;
}

// CRC32 table & function
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate 192x192 and 512x512
const icon192 = createPNG(192, 192, '#0D9488');
const icon512 = createPNG(512, 512, '#0D9488');

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), icon192);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), icon512);
fs.writeFileSync(path.resolve('public/apple-touch-icon.png'), icon192);
console.log('✅ Generated PWA PNG Icons (192x192 & 512x512) and apple-touch-icon.png');
