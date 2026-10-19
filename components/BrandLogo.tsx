import Image from 'next/image';

type BrandLogoProps = {
  size?: number;
  subtitle?: string;
};

/** Compact lockup made from the existing transparent, background-free logo. */
export default function BrandLogo({ size = 44, subtitle = 'ROKTOKOROBI' }: BrandLogoProps) {
  const imageSize = Math.round(size * 1.5);
  return (
    <span className="rk-brand-lockup" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
      <span aria-hidden="true" style={{ display: 'block', position: 'relative', flex: `0 0 ${size}px`, width: size, height: size, overflow: 'hidden' }}>
        <Image
          src="/roktokorobi-logo.png"
          alt=""
          width={imageSize}
          height={imageSize}
          style={{ position: 'absolute', top: -Math.round(imageSize * 0.05), left: -Math.round((imageSize - size) / 2), width: imageSize, height: imageSize, maxWidth: 'none' }}
        />
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, minWidth: 0 }}>
        <strong style={{ color: '#A5102F', fontFamily: "'Hind Siliguri', serif", fontSize: 'clamp(16px, 1.3vw, 19px)', whiteSpace: 'nowrap' }}>রক্তকরবী</strong>
        <small style={{ color: '#6B5A50', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', whiteSpace: 'nowrap' }}>{subtitle}</small>
      </span>
    </span>
  );
}
