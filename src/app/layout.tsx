import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'Contagion Simulator | Network Cascade Visualization',
  description: 'Interactive visualization of epidemic spread and financial contagion through network systems. Built with D3.js, React, and WebWorkers.',
  keywords: ['visualization', 'D3.js', 'epidemic', 'financial', 'contagion', 'network', 'simulation'],
  authors: [{ name: 'Roshan Shetty' }],
  openGraph: {
    title: 'Contagion Simulator | Network Cascade Visualization',
    description: 'Watch diseases spread through populations or financial crises cascade through banking networks in real-time.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contagion Simulator',
    description: 'Interactive network cascade visualization - epidemic and financial modes.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-canvas text-white antialiased">
        {children}
      </body>
    </html>
  );
}
