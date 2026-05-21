import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Navbar */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          <h1 className="text-2xl font-bold">
            FORMPILOT
          </h1>

          <button className="px-4 py-2 rounded-lg border">
            Logout
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

    </div>
  );
}