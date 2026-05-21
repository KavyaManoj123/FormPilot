"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#171717",
            color: "#f4f4f5",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      />
      {children}
    </SessionProvider>
  );
}
