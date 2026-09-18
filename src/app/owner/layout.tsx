import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Owner | Ster Schoonmaak" };
export default function OwnerLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
