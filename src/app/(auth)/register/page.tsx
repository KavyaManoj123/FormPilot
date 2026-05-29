"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";

import AuthLayout from "@/components/auth/auth-layout";
import GoogleAuthButton from "@/components/auth/google-auth-button";

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

      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
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
      <div className="space-y-4">
        <GoogleAuthButton label="Continue with Google" />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
            or register with email
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

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
      </div>

      <p className="mt-6 text-center text-gray-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-cyan-400"
        >
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
