"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

const PLACEHOLDER_SRC = "/produtos/placeholder.svg";

type Props = Omit<ImageProps, "src" | "onError"> & { src: string | null | undefined };

/**
 * Wrapper de next/image que nunca quebra a UI: cai para o placeholder local
 * quando `src` está vazio ou quando o carregamento falha (arquivo removido do
 * Storage, link externo indisponível, etc).
 */
export default function ImageWithFallback({ src, alt, ...rest }: Props) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  const effectiveSrc = !src || errored ? PLACEHOLDER_SRC : src;

  return <Image src={effectiveSrc} alt={alt} onError={() => setErrored(true)} {...rest} />;
}
