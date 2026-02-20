"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import GenerativePattern from "./GenerativePattern";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSeed: string;
  fallbackTags: string[];
  fallbackClassName?: string;
}

function isSupabaseUrl(src: string | undefined): boolean {
  if (!src) return false;
  try {
    return new URL(src).hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

export default function SafeImage({
  fallbackSeed,
  fallbackTags,
  fallbackClassName,
  src,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <GenerativePattern
        seed={fallbackSeed}
        tags={fallbackTags}
        className={fallbackClassName ?? "h-full w-full"}
      />
    );
  }

  const srcString = typeof src === "string" ? src : undefined;

  return (
    // eslint-disable-next-line jsx-a11y/alt-text -- alt is passed via ...props
    <Image
      src={src}
      unoptimized={!isSupabaseUrl(srcString)}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
