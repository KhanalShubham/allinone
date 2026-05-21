import sharp from 'sharp';
import type { ImageFormat } from '../types';

export async function compressImage(
  buffer: Buffer,
  quality: number,
  format: 'jpeg' | 'webp' | 'png',
): Promise<{ data: Buffer; format: string }> {
  const data = await sharp(buffer).toFormat(format, { quality }).toBuffer();
  return { data, format };
}

export async function resizeImage(
  buffer: Buffer,
  width?: number,
  height?: number,
): Promise<{ data: Buffer; format: string }> {
  const result = await sharp(buffer)
    .resize(width, height, { fit: 'inside', withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true });
  return { data: result.data, format: result.info.format };
}

export async function convertImage(buffer: Buffer, format: ImageFormat): Promise<Buffer> {
  return sharp(buffer).toFormat(format).toBuffer();
}
