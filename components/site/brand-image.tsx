import Image from "next/image";

type BrandImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  preload?: boolean;
  className?: string;
};

export function BrandImage({
  src,
  alt,
  width,
  height,
  sizes,
  preload = false,
  className = "",
}: BrandImageProps) {
  return (
    <figure className={`brand-image ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        preload={preload}
        className="brand-image__media"
      />
    </figure>
  );
}
