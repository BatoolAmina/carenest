"use client";
import { memo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Building2, Microscope, Pill, BedDouble, HeartHandshake, HeartPulse, Car, Coffee, Stethoscope } from "lucide-react";

// Icons are referenced by name so server components can pass them (components can't cross the server/client boundary).
const ICONS = { Building2, Microscope, Pill, BedDouble, HeartHandshake, HeartPulse, Car, Coffee, Stethoscope };
const REMOTE_IMAGES = {
  about: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=85",
  "facility-1": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=85",
  "facility-2": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=85",
  "facility-3": "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=1200&q=85",
  "facility-4": "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=85",
};
const GENERATED_IMAGES = {
  about: "/images/generated-about.svg",
  "facility-1": "/images/generated-facility-1.svg",
  "facility-2": "/images/generated-facility-2.svg",
  "facility-3": "/images/generated-facility-3.svg",
  "facility-4": "/images/generated-facility-4.svg",
};

/** Image with graceful gradient fallback when the file hasn't been added yet. */
export const Photo = memo(function Photo({ src, alt, className, icon }) {
  const Icon = ICONS[icon];
  const [failedLocal, setFailedLocal] = useState(false);
  const [failedGenerated, setFailedGenerated] = useState(false);
  const [failedRemote, setFailedRemote] = useState(false);
  const fallbackKey = src?.split("/").pop()?.replace(/\.[^.]+$/, "");
  const generatedSrc = GENERATED_IMAGES[fallbackKey];
  const remoteSrc = REMOTE_IMAGES[fallbackKey];
  if (!src || (failedLocal && failedGenerated && (!remoteSrc || failedRemote))) {
    return (
      <div role="img" aria-label={alt} className={clsx("relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-forest via-primary/70 to-sage", className)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(var(--gold)/.35),transparent_55%)]" />
        {Icon && <Icon className="relative h-1/3 w-1/3 text-champagne/80" strokeWidth={1.2} />}
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  const imageSrc = failedLocal ? (failedGenerated ? remoteSrc : generatedSrc) : src;
  return (
    <div className={clsx("relative overflow-hidden", className)}>
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        onError={() => (failedLocal ? (failedGenerated ? setFailedRemote(true) : setFailedGenerated(true)) : setFailedLocal(true))}
        className="object-cover"
      />
    </div>
  );
});

export const Avatar = memo(function Avatar({ name = "?", src, className = "h-14 w-14" }) {
  const [failed, setFailed] = useState(false);
  const initials = name.replace(/^Dr\.?\s*/i, "").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  if (src && !failed) return (
    <div className={clsx("relative overflow-hidden rounded-full ring-2 ring-gold/50", className)}>
      <Image src={src} alt={name} fill sizes="56px" onError={() => setFailed(true)} className="object-cover" />
    </div>
  );
  return <div aria-label={name} className={clsx("flex items-center justify-center rounded-full bg-gradient-to-br from-forest to-primary font-semibold text-champagne ring-2 ring-gold/50", className)}>{initials}</div>;
});
