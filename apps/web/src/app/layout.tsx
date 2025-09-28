import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { Navbar } from '@/components/navbar';
import Providers from "@/components/providers";
import { WalletProvider } from "@/components/web3/WalletProvider";

const inter = Inter({ subsets: ['latin'] });

const appUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

// Embed metadata for Farcaster sharing
const frame = {
  version: "1",
  imageUrl: `${appUrl}/opengraph-image.png`,
  button: {
    title: "Launch GenkiFi",
    action: {
      type: "launch_frame",
      name: "GenkiFi",
      url: appUrl,
      splashImageUrl: `${appUrl}/icon.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
};

export const metadata: Metadata = {
  title: 'GenkiFi',
  description: 'GenkiFi is the first gamified social DeFi platform built specifically for emerging markets on Celo blockchain',
  manifest: '/manifest.json', // ← Agregar esta línea
  themeColor: '#00D4AA', // ← Agregar esta línea
  openGraph: {
    title: 'GenkiFi',
    description: 'GenkiFi is the first gamified social DeFi platform built specifically for emerging markets on Celo blockchain',
    images: [`${appUrl}/opengraph-image.png`],
  },
  other: {
    "fc:frame": JSON.stringify(frame),
    // Agregar estas líneas para PWA
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "GenkiFi",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navbar is included on all pages */}
        <div className="relative flex min-h-screen flex-col">
          <Providers>
            <WalletProvider>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
            </WalletProvider>
          </Providers>
        </div>
      </body>
    </html>
  );
}
