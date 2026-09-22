import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({
  className = "",
  width = 180,
  height = 45,
}: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`}>
      <Image
        src="/images/logo.png"
        alt="TechTrack"
        width={width}
        height={height}
        priority
        className="rounded-lg object-contain"
      />
    </Link>
  );
}

