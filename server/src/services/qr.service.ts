import QRCode from 'qrcode';

export async function generateQr(
  text: string,
  size: number,
  color: string,
  background: string,
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    color: { dark: color, light: background },
    errorCorrectionLevel: 'H',
  });
}
