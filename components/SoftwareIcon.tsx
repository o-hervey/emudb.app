'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CATEGORY_ICON_COLORS } from './CategoryBadge';

function faviconUrl(websiteUrl: string): string | null {
  try {
    const { hostname } = new URL(websiteUrl);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return null;
  }
}

export function SoftwareIcon({
  name,
  category,
  websiteUrl,
  size = 40,
  rounded = 'lg',
}: {
  name: string;
  category: string;
  websiteUrl?: string | null;
  size?: number;
  rounded?: 'lg' | '2xl';
}) {
  const [failed, setFailed] = useState(false);

  const color = CATEGORY_ICON_COLORS[category] ?? '#8868F0';
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  const roundedClass = rounded === '2xl' ? 'rounded-2xl' : 'rounded-lg';
  const src = websiteUrl && !failed ? faviconUrl(websiteUrl) : null;

  if (src) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 overflow-hidden ${roundedClass}`}
        style={{ width: size, height: size, backgroundColor: `${color}22` }}
        aria-hidden="true"
      >
        <Image
          src={src}
          alt=""
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center text-white font-bold shrink-0 ${roundedClass}`}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.3 }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
