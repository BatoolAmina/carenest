import Image from "next/image";
import Link from "next/link";
/** Official CareNest logo (public/logo.png). `compact` crops to the emblem + wordmark height. */
export function Logo({ className = "h-12", href = "/", priority }) {
  return (
    <Link href={href} aria-label="CareNest home" className="inline-flex items-center">
      <Image src="/logo.png" alt="CareNest — Care Today, Brighter Tomorrows" width={900} height={600} priority={priority} className={`${className} w-auto object-contain`} />
    </Link>
  );
}
