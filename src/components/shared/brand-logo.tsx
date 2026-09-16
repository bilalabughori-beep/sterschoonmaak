import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { siteConfig } from "@/config/site";

const logoRelativePath = "brand/ster-schoonmaak-logo.png";
const logoFilePath = path.join(process.cwd(), "public", logoRelativePath);
const hasOfficialLogo = fs.existsSync(logoFilePath);

export function BrandLogo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  if (hasOfficialLogo) {
    return (
      <Image
        src={`/${logoRelativePath}`}
        alt={siteConfig.brandName}
        width={128}
        height={128}
        priority
        className="h-[5.5rem] w-[5.5rem] object-contain sm:h-24 sm:w-24"
      />
    );
  }

  return (
    <span className="inline-flex flex-col leading-none" aria-label={siteConfig.brandName}>
      <span
        className={`text-lg font-extrabold tracking-[0.16em] ${tone === "light" ? "text-white" : "text-navy"}`}
      >
        STER
      </span>
      <span
        className={`mt-1 text-[0.65rem] font-semibold tracking-[0.2em] ${tone === "light" ? "text-[#9fc0ff]" : "text-primary"}`}
      >
        SCHOONMAAK
      </span>
    </span>
  );
}
