"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface UpgradePlanButtonProps {
  className: string;
  label?: string;
}

export default function UpgradePlanButton({
  className,
  label = "Upgrade to Pro",
}: UpgradePlanButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/account/upgrade", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to upgrade plan");
      }

      toast.success("Your workspace is now on Pro.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to upgrade plan"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleUpgrade}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? <LoaderCircle size={16} className="animate-spin" /> : null}
      <span>{label}</span>
    </button>
  );
}
