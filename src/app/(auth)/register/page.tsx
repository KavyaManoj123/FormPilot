"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthLayout from "@/components/auth/auth-layout";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleRegister(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      toast.success(
        "Account created successfully"
      );

      router.push("/login");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start building forms today"
    >
      <form
        onSubmit={handleRegister}
        className="space-y-3"
      >
        <input
          type="text"
          placeholder="Name"
          className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white outline-none"
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white outline-none"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white outline-none"
          value={formData.password}
          onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value,
            })
          }
        />

        <button
          disabled={loading}
          className="w-full rounded-lg bg-cyan-500 p-3 font-semibold text-white transition hover:bg-cyan-400"
        >
          {loading
            ? "Creating..."
            : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-400">
        Already have an account?{" "}
        <a
          href="/login"
          className="text-cyan-400"
        >
          Login
        </a>
      </p>
    </AuthLayout>
  );
}
