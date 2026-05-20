import React from "react";

export default function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-[#0B1120]">
      {/* GLOW EFFECTS */}
      <div className="absolute left-[-150px] top-[-150px] h-[350px] w-[350px] rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="absolute bottom-[-150px] right-[-150px] h-[350px] w-[350px] rounded-full bg-purple-500/20 blur-3xl" />

      {/* LEFT SIDE */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden p-10 lg:flex">
        <div className="relative z-10 max-w-md">
          <div className="mb-5 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
            🚀 AI Powered Form Builder
          </div>

          <h1 className="text-5xl font-extrabold leading-tight text-white">
            Build smarter forms with
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {" "}
              FormPilot
            </span>
          </h1>

          <p className="mt-5 text-base leading-relaxed text-gray-300">
            Create forms, collect responses,
            analyze insights and automate
            workflows effortlessly.
          </p>

          {/* MOCKUP */}
          <div className="relative mt-10">
            <div className="absolute inset-0 rounded-3xl bg-cyan-500/20 blur-2xl" />

            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>

              <div className="mt-6 space-y-3">
                <div className="h-3 rounded bg-cyan-400/40" />
                <div className="h-3 w-2/3 rounded bg-cyan-400/20" />

                <div className="mt-5 rounded-2xl bg-[#0F172A] p-4">
                  <div className="space-y-2">
                    <div className="h-8 rounded-lg bg-white/5" />
                    <div className="h-8 rounded-lg bg-white/5" />
                    <div className="h-8 w-1/2 rounded-lg bg-cyan-500/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />

        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="text-3xl font-bold text-white">
              {title}
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              {subtitle}
            </p>

            <div className="mt-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}