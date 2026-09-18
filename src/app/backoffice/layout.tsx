import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Backoffice | Ster Schoonmaak" };
export default function BackofficeLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
