import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Logo({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/images/logo.png"
      alt="Team Brz Motorcycle Club"
      width={size}
      height={size}
      className={cn("rounded-full", className)}
      priority
    />
  );
}
