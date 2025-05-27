import './globals.css';
import { Inter } from 'next/font/google';
import WalletProvider from '@/components/WalletProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Solana Jackpot Platform',
  description: 'A web-based jackpot platform on Solana with 60-second cycles',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151',
              },
            }}
          />
        </WalletProvider>
      </body>
    </html>
  );
} 