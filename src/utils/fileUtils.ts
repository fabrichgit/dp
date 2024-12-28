import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { createUnzip } from 'zlib';
import { Extract } from 'unzipper';

export async function extractZip(zipPath: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(Extract({ path: destPath }))
      .on('close', resolve)
      .on('error', reject);
  });
}