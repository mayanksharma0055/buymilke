import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buyमिलके | Car buying, together",
  description: "Find your next car and join a local group of buyers working toward a better deal together.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
