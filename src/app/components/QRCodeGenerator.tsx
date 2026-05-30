import { useEffect, useRef } from 'react';

// Simple QR Code implementation
function generateQRCode(text: string, size: number = 180): string {
  // Using a QR code API service
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
}

interface Props {
  roomCode: string;
  isHostMode: boolean;
}

export default function QRCodeGenerator({ roomCode, isHostMode }: Props) {
  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/wansni?room=${roomCode}`
    : '';

  return (
    <div className="p-4 rounded-2xl bg-black/30 mt-4">
      <div className="text-white text-center">رقم القعدة:</div>
      <h2
        className={`text-center font-bold text-[#facc15] ${
          isHostMode ? 'text-[70px] tracking-[8px]' : 'text-4xl tracking-wider'
        }`}
      >
        {roomCode}
      </h2>
      <div className="flex justify-center bg-white p-4 rounded-2xl mt-4">
        <img
          src={generateQRCode(joinUrl, isHostMode ? 225 : 180)}
          alt="QR Code"
          className={isHostMode ? 'scale-125' : ''}
        />
      </div>
      <p className="text-white/70 text-center mt-2 text-sm">
        خل الربع يصورون الكود بالكاميرا ويدخلون القعدة
      </p>
    </div>
  );
}
