import QRCode from 'qrcode';

const ink = '#2A1A14';
const cream = '#F6EEDD';
const crimson = '#B8132A';

export const buildPartnerLink = (rawCode: string) => {
  const code = rawCode.trim().toUpperCase();
  if (code === 'YOUR-CODE' || !/^[A-Z0-9-]{4,32}$/.test(code)) throw new Error('A valid partner code is required.');
  return `https://www.roktokorobi.org/register?ref=${encodeURIComponent(code)}`;
};

export const qrForLink = (link: string) => QRCode.toDataURL(link, {
  width: 720, margin: 2, errorCorrectionLevel: 'M', color: { dark: ink, light: '#FFFFFF' },
});

export function downloadImage(dataUrl: string, filename: string) {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxSize: number, weight = 700) {
  let size = maxSize;
  do {
    context.font = `${weight} ${size}px 'Hind Siliguri', sans-serif`;
    if (context.measureText(text).width <= maxWidth) return;
    size -= 2;
  } while (size > 26);
}

export async function makePartnerArtwork(options: { name: string; code: string; link: string; format: 'poster' | 'flyer' }) {
  await document.fonts.ready;
  const poster = options.format === 'poster';
  const width = poster ? 1200 : 1080;
  const height = poster ? 1600 : 1280;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser cannot create an image.');

  context.fillStyle = cream;
  context.fillRect(0, 0, width, height);
  context.fillStyle = crimson;
  context.fillRect(0, 0, width, poster ? 465 : 350);
  context.textAlign = 'center';
  context.fillStyle = '#FFFFFF';
  fitText(context, 'রক্ত দিন, জীবন বাঁচান', width - 120, poster ? 74 : 66);
  context.fillText('রক্ত দিন, জীবন বাঁচান', width / 2, poster ? 190 : 140);
  fitText(context, 'Give blood. Save a life.', width - 120, poster ? 58 : 48, 600);
  context.fillText('Give blood. Save a life.', width / 2, poster ? 265 : 205);
  fitText(context, options.name, width - 120, poster ? 46 : 40, 600);
  context.fillText(options.name, width / 2, poster ? 375 : 292);

  const qr = new Image();
  qr.src = await qrForLink(options.link);
  await qr.decode();
  const qrSize = poster ? 650 : 515;
  const qrTop = poster ? 565 : 415;
  context.fillStyle = '#FFFFFF';
  context.fillRect((width - qrSize) / 2 - 20, qrTop - 20, qrSize + 40, qrSize + 40);
  context.drawImage(qr, (width - qrSize) / 2, qrTop, qrSize, qrSize);

  context.fillStyle = ink;
  fitText(context, 'Scan to register as a donor', width - 110, poster ? 42 : 34, 600);
  context.fillText('Scan to register as a donor', width / 2, qrTop + qrSize + (poster ? 95 : 70));
  context.fillStyle = crimson;
  fitText(context, `Referral code: ${options.code}`, width - 110, poster ? 40 : 30, 700);
  context.fillText(`Referral code: ${options.code}`, width / 2, qrTop + qrSize + (poster ? 170 : 120));
  context.fillStyle = ink;
  fitText(context, options.link, width - 100, poster ? 25 : 19, 500);
  context.fillText(options.link, width / 2, height - 64);
  return canvas.toDataURL('image/png');
}
