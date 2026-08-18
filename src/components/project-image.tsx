import Image from "next/image";
import { cn } from "@/lib/utils";

/** Project thumbnail with a typographic fallback when no image_url is recorded. */
export function ProjectImage({
  src,
  name,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw",
  priority = false,
}: {
  src?: string | null;
  name: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[16/9] w-full overflow-hidden rounded-md border border-line bg-bg-subtle",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,var(--bg-subtle),var(--accent-bg))]">
          <span className="font-mono text-2xl font-semibold text-fg-muted/70">
            {name.slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
