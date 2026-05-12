/**
 * Self-developed lightweight ZIP archive builder.
 * Replacement for JSZip — write-only (no reading).
 *
 * Uses the browser-native CompressionStream API for deflate compression
 * and manually constructs the ZIP file format structures.
 */

// ZIP format constants
const LOCAL_FILE_HEADER_SIG = 0x04034b50;
const CENTRAL_DIR_HEADER_SIG = 0x02014b50;
const END_OF_CENTRAL_DIR_SIG = 0x06054b50;
const COMPRESSION_DEFLATE = 8;
const VERSION_NEEDED = 20; // 2.0 for deflate

interface ZipEntry {
  path: string;
  data: Uint8Array;
  compressed: Uint8Array;
  crc32: number;
  method: number;
}

/**
 * CRC-32 lookup table (pre-computed).
 */
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function encodeUtf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

async function deflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream("deflate-raw");
  const writer = cs.writable.getWriter();
  writer.write(data as unknown as ArrayBuffer);
  writer.close();

  const reader = cs.readable.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.length;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

function writeUint16LE(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function writeUint32LE(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
}

/**
 * ZIP archive builder. Compatible with the JsZipInstance interface used in AGM Studio.
 */
export class ZipArchive {
  private entries: { path: string; data: Uint8Array | Promise<Uint8Array> }[] =
    [];

  file(path: string, content: string | Blob): void {
    if (typeof content === "string") {
      this.entries.push({ path, data: encodeUtf8(content) });
    } else {
      this.entries.push({
        path,
        data: content.arrayBuffer().then((ab) => new Uint8Array(ab)),
      });
    }
  }

  async generateAsync(_options: { type: "blob" }): Promise<Blob> {
    // Resolve all entries
    const resolved: ZipEntry[] = [];
    for (const entry of this.entries) {
      const data =
        entry.data instanceof Promise ? await entry.data : entry.data;
      const crc = crc32(data);
      const compressed = await deflateRaw(data);
      resolved.push({
        path: entry.path,
        data,
        compressed,
        crc32: crc,
        method: COMPRESSION_DEFLATE,
      });
    }

    // Calculate total size
    let localHeadersSize = 0;
    let centralDirSize = 0;
    for (const entry of resolved) {
      const nameBytes = encodeUtf8(entry.path);
      localHeadersSize += 30 + nameBytes.length + entry.compressed.length;
      centralDirSize += 46 + nameBytes.length;
    }
    const eocdSize = 22;
    const totalSize = localHeadersSize + centralDirSize + eocdSize;

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // Write local file headers + data
    let offset = 0;
    const offsets: number[] = [];
    for (const entry of resolved) {
      const nameBytes = encodeUtf8(entry.path);
      offsets.push(offset);

      writeUint32LE(view, offset, LOCAL_FILE_HEADER_SIG);
      writeUint16LE(view, offset + 4, VERSION_NEEDED);
      writeUint16LE(view, offset + 6, 0); // general purpose bit flag
      writeUint16LE(view, offset + 8, entry.method);
      writeUint16LE(view, offset + 10, 0); // last mod time
      writeUint16LE(view, offset + 12, 0); // last mod date
      writeUint32LE(view, offset + 14, entry.crc32);
      writeUint32LE(view, offset + 18, entry.compressed.length);
      writeUint32LE(view, offset + 22, entry.data.length);
      writeUint16LE(view, offset + 26, nameBytes.length);
      writeUint16LE(view, offset + 28, 0); // extra field length
      bytes.set(nameBytes, offset + 30);
      bytes.set(entry.compressed, offset + 30 + nameBytes.length);
      offset += 30 + nameBytes.length + entry.compressed.length;
    }

    // Write central directory
    const centralDirOffset = offset;
    for (let i = 0; i < resolved.length; i++) {
      const entry = resolved[i];
      const nameBytes = encodeUtf8(entry.path);

      writeUint32LE(view, offset, CENTRAL_DIR_HEADER_SIG);
      writeUint16LE(view, offset + 4, VERSION_NEEDED); // version made by
      writeUint16LE(view, offset + 6, VERSION_NEEDED); // version needed
      writeUint16LE(view, offset + 8, 0); // general purpose bit flag
      writeUint16LE(view, offset + 10, entry.method);
      writeUint16LE(view, offset + 12, 0); // last mod time
      writeUint16LE(view, offset + 14, 0); // last mod date
      writeUint32LE(view, offset + 16, entry.crc32);
      writeUint32LE(view, offset + 20, entry.compressed.length);
      writeUint32LE(view, offset + 24, entry.data.length);
      writeUint16LE(view, offset + 28, nameBytes.length);
      writeUint16LE(view, offset + 30, 0); // extra field length
      writeUint16LE(view, offset + 32, 0); // file comment length
      writeUint16LE(view, offset + 34, 0); // disk number start
      writeUint16LE(view, offset + 36, 0); // internal file attrs
      writeUint32LE(view, offset + 38, 0); // external file attrs
      writeUint32LE(view, offset + 42, offsets[i]); // local header offset
      bytes.set(nameBytes, offset + 46);
      offset += 46 + nameBytes.length;
    }

    // Write EOCD
    writeUint32LE(view, offset, END_OF_CENTRAL_DIR_SIG);
    writeUint16LE(view, offset + 4, 0); // disk number
    writeUint16LE(view, offset + 6, 0); // disk with central dir
    writeUint16LE(view, offset + 8, resolved.length); // entries on this disk
    writeUint16LE(view, offset + 10, resolved.length); // total entries
    writeUint32LE(view, offset + 12, centralDirSize); // central dir size
    writeUint32LE(view, offset + 16, centralDirOffset); // central dir offset
    writeUint16LE(view, offset + 20, 0); // comment length

    return new Blob([buffer], { type: "application/zip" });
  }
}
