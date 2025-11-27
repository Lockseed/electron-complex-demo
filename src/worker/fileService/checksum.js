import crypto from 'node:crypto';
import fs from 'node:fs';

/**
 *
 * @param {fs.PathLike} filePath
 * @param {string} algorithm
 * @returns {Promise<string>}
 */
export function calculateChecksum(filePath, algorithm = 'sha256') {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => {
      hash.update(chunk);
    });

    stream.on('end', () => {
      const checksum = hash.digest('hex');
      resolve(checksum);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}
