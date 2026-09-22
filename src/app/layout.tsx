import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TechTrack — Gestão Inteligente de Ordens de Serviço",
  description: "Plataforma de alta precisão para rastreamento e gestão de ordens de serviço e reparos técnicos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-brand-background text-brand-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}

