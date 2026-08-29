import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div aria-hidden="true" style={style} className={cn("pf-skeleton", className)} />
  );
}
