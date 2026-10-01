/**
 * Produces NEIBOURLY.zip from the project source, excluding build output,
 * dependencies and tooling noise. Runs after `npm run build` is optional; the
 * zip is meant to be reviewable and openable without installing anything.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync, crc32 } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = process.argv[2] ?? resolve(root, '..', 'NEIBOURLY.zip');

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.github', 'coverage', '.vite', '.cache']);
const SKIP_FILES = new Set(['NEIBOURLY.zip', '.DS_Store', 'Thumbs.db', 'package-lock.json']);

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walk(full, acc);
    } else {
      if (SKIP_FILES.has(name)) continue;
      if (/\.(log|tmp|tsbuildinfo)$/.test(name)) continue;
      acc.push(full);
    }
  }
  return acc;
}

const files = walk(root).sort();
if (files.length > 99) {
  console.error(`make-zip: ${files.length} files exceeds the 99-file limit.`);
  process.exit(1);
}

// Minimal ZIP writer (store + deflate), so the build needs no archiver
// dependency and produces byte-identical output on any platform.
const chunks = [];
const central = [];
let offset = 0;

const dosTime = () => {
  const d = new Date();
  return {
    time: ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() / 2)) & 0xffff,
    date: (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff,
  };
};

for (const file of files) {
  const name = relative(root, file).split(sep).join('/');
  const nameBuf = Buffer.from(name, 'utf8');
  const data = readFileSync(file);
  const deflated = deflateRawSync(data, { level: 9 });
  const useDeflate = deflated.length < data.length;
  const payload = useDeflate ? deflated : data;
  const method = useDeflate ? 8 : 0;
  const { time, date } = dosTime();
  const sum = crc32(data);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x0800, 6);
  local.writeUInt16LE(method, 8);
  local.writeUInt16LE(time, 10);
  local.writeUInt16LE(date, 12);
  local.writeUInt32LE(sum, 14);
  local.writeUInt32LE(payload.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBuf.length, 26);
  local.writeUInt16LE(0, 28);

  chunks.push(local, nameBuf, payload);

  const cd = Buffer.alloc(46);
  cd.writeUInt32LE(0x02014b50, 0);
  cd.writeUInt16LE(20, 4);
  cd.writeUInt16LE(20, 6);
  cd.writeUInt16LE(0x0800, 8);
  cd.writeUInt16LE(method, 10);
  cd.writeUInt16LE(time, 12);
  cd.writeUInt16LE(date, 14);
  cd.writeUInt32LE(sum, 16);
  cd.writeUInt32LE(payload.length, 20);
  cd.writeUInt32LE(data.length, 24);
  cd.writeUInt16LE(nameBuf.length, 28);
  cd.writeUInt16LE(0, 30);
  cd.writeUInt16LE(0, 32);
  cd.writeUInt16LE(0, 34);
  cd.writeUInt16LE(0, 36);
  cd.writeUInt32LE(0, 38);
  cd.writeUInt32LE(offset, 42);

  central.push(cd, nameBuf);
  offset += local.length + nameBuf.length + payload.length;
}

const centralBuf = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(0, 4);
end.writeUInt16LE(0, 6);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(centralBuf.length, 12);
end.writeUInt32LE(offset, 16);
end.writeUInt16LE(0, 20);

writeFileSync(outFile, Buffer.concat([...chunks, centralBuf, end]));
console.log(`make-zip: ${files.length} files -> ${outFile}`);
