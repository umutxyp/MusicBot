'use strict';

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

/**
 * Minimal ZIP extractor (stored and deflate entries, Unix permissions and symlinks).
 * Used to install yt-dlp without depending on unzip/tar/ditto being present on the system.
 */
function extractZip(buffer, destination) {
    const eocd = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    if (eocd < 0) throw new Error('Not a ZIP file');
    const entries = buffer.readUInt16LE(eocd + 10);
    let offset = buffer.readUInt32LE(eocd + 16);
    const root = path.resolve(destination);
    fs.mkdirSync(root, { recursive: true });
    const symlinks = [];

    for (let i = 0; i < entries; i++) {
        if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error('Corrupt ZIP central directory');
        const method = buffer.readUInt16LE(offset + 10);
        const compressedSize = buffer.readUInt32LE(offset + 20);
        const nameLength = buffer.readUInt16LE(offset + 28);
        const extraLength = buffer.readUInt16LE(offset + 30);
        const commentLength = buffer.readUInt16LE(offset + 32);
        const externalAttributes = buffer.readUInt32LE(offset + 38);
        const localOffset = buffer.readUInt32LE(offset + 42);
        const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);
        offset += 46 + nameLength + extraLength + commentLength;

        const target = path.resolve(root, name);
        if (target !== root && !target.startsWith(root + path.sep)) throw new Error(`Unsafe path in ZIP: ${name}`);

        const mode = externalAttributes >>> 16;
        const type = mode & 0o170000;
        if (name.endsWith('/') || type === 0o040000) {
            fs.mkdirSync(target, { recursive: true });
            continue;
        }

        if (buffer.readUInt32LE(localOffset) !== 0x04034b50) throw new Error(`Corrupt ZIP entry: ${name}`);
        const dataStart = localOffset + 30 + buffer.readUInt16LE(localOffset + 26) + buffer.readUInt16LE(localOffset + 28);
        const raw = buffer.subarray(dataStart, dataStart + compressedSize);
        let data;
        if (method === 0) data = raw;
        else if (method === 8) data = zlib.inflateRawSync(raw);
        else throw new Error(`Unsupported ZIP compression method ${method} for ${name}`);

        fs.mkdirSync(path.dirname(target), { recursive: true });
        if (type === 0o120000) {
            symlinks.push([data.toString('utf8'), target]);
            continue;
        }
        fs.writeFileSync(target, data);
        if (process.platform !== 'win32' && mode & 0o777) fs.chmodSync(target, mode & 0o777);
    }

    for (const [linkTarget, linkPath] of symlinks) {
        const resolved = path.resolve(path.dirname(linkPath), linkTarget);
        if (!resolved.startsWith(root + path.sep)) throw new Error(`Unsafe symlink in ZIP: ${linkPath}`);
        fs.rmSync(linkPath, { force: true });
        fs.symlinkSync(linkTarget, linkPath);
    }
    return entries;
}

module.exports = { extractZip };
