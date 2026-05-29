"use client";

import { LoaderCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";

interface GoogleAuthButtonProps {
  label: string;
}

export default function GoogleAuthButton({
  label,
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleGoogleAuth() {
    try {
      setLoading(true);

      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch {
      setLoading(false);
      toast.error("Unable to continue with Google");
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <LoaderCircle size={18} className="animate-spin" />
      ) : (
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
        >
          <path
            d="M21.805 10.023h-9.18v3.955h5.273c-.227 1.273-.955 2.352-2.046 3.08v2.56h3.318c1.943-1.79 3.055-4.43 3.055-7.59 0-.676-.06-1.324-.22-2.005Z"
            fill="#4285F4"
          />
          <path
            d="M12.625 22c2.768 0 5.09-.913 6.784-2.382l-3.318-2.56c-.923.618-2.105.99-3.466.99-2.666 0-4.924-1.8-5.73-4.216H3.47v2.64A10.244 10.244 0 0 0 12.625 22Z"
            fill="#34A853"
          />
          <path
            d="M6.895 13.832a6.15 6.15 0 0 1-.32-1.832c0-.637.114-1.255.32-1.832V7.528H3.47A10.12 10.12 0 0 0 2.625 12c0 1.62.39 3.154.845 4.472l3.425-2.64Z"
            fill="#FBBC05"
          />
          <path
            d="M12.625 5.952c1.5 0 2.84.516 3.9 1.533l2.92-2.92C17.709 2.94 15.393 2 12.625 2A10.244 10.244 0 0 0 3.47 7.528l3.425 2.64c.806-2.416 3.064-4.216 5.73-4.216Z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span>{label}</span>
    </button>
  );
}
