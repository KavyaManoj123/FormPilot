import Image from "next/image";
import Link from "next/link";

interface FormPilotLogoProps {
  href?: string;
  iconSize?: number;
  titleClassName?: string;
  subtitle?: string;
  subtitleClassName?: string;
  showWordmark?: boolean;
}

export default function FormPilotLogo({
  href = "/dashboard",
  iconSize = 44,
  titleClassName = "text-2xl font-semibold tracking-[-0.05em] text-white",
  subtitle,
  subtitleClassName = "text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500",
  showWordmark = true,
}: FormPilotLogoProps) {
  const content = (
    <>
      <Image
        src="/formpilot-icon.svg"
        alt="FormPilot"
        width={iconSize}
        height={iconSize}
        className="shrink-0 rounded-2xl"
        priority
      />

      {showWordmark ? (
        <div className="min-w-0">
          {subtitle ? <p className={subtitleClassName}>{subtitle}</p> : null}
          <p className={titleClassName}>FormPilot</p>
        </div>
      ) : null}
    </>
  );

  return (
    <Link href={href} className="inline-flex items-center gap-3">
      {content}
    </Link>
  );
}
