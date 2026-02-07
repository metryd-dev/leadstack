import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'LeadStack',
  description: 'Lead intake and review platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Arial, sans-serif', maxWidth: 720, margin: '0 auto', padding: 24 }}>{children}</body>
    </html>
  );
}
