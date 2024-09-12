import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Web3ModalProvider from "../context/Web3Modal";
import "./globals.css";
import { cn } from "@/lib/utils";
import Nav from "@/components/Nav";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Morph Holesky Starter Kit",
  description: "A starter kit for building on Morph Holesky",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#070E1B]">
      <body
        className={cn(
          "min-h-screen bg-[#070E1B] text-white  font-sans antialiased"
        )}
      >
        <div id="root" className="p-4">
          <Web3ModalProvider>
            <Nav />
            {children}
          </Web3ModalProvider>
        </div>
        <Toaster richColors />
      </body>
    </html>
  );
}
