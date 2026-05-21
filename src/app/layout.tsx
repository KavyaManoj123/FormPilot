import "./globals.css";
import type { Metadata } from "next";

import Providers from "@/providers/session-provider";

export const metadata: Metadata = {
  title: "FormPilot",
  description: "Build forms. Collect responses.",
  icons: {
    icon: "/formpilot-icon.svg",
    shortcut: "/formpilot-icon.svg",
    apple: "/formpilot-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
