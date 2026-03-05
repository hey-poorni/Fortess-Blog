'use client';

import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function Logo({ className, iconClassName, textClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex items-center justify-center bg-orange-100 p-1.5 rounded-full overflow-hidden">
        <Image
          src="/blogger-icon.png"
          alt="Blogger Icon"
          width={28}
          height={28}
          className={cn("object-cover", iconClassName)}
          priority
        />
        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full pointer-events-none" />
      </div>
      <span className={cn("font-headline text-2xl font-bold tracking-tight text-foreground", textClassName)}>
        Fortress
      </span>
    </div>
  );
}
