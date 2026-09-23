import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc] px-4 py-12">
      <div className="mb-6 flex flex-col items-center text-center">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#2563eb] text-xl font-bold text-white shadow-sm">
            T
          </span>
          <span className="text-2xl font-bold tracking-tight text-[#004ac6]">TechTrack</span>
        </Link>
        <p className="mt-2 text-sm text-[#515f74]">
          Plataforma de Alta Precisão para Ordens de Serviço
        </p>
      </div>
      <div className="w-full max-w-md">
        <SignIn routing="hash" fallbackRedirectUrl="/post-login" />
      </div>
    </main>
  );
}