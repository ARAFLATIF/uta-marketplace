import './globals.css';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from './logout-button';

export const metadata = {
  title: 'Mavs Marketplace',
  description: 'Buy and sell with fellow UTA students.',
};

export default async function RootLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="font-body min-h-screen">
        <header className="bg-mavs-navy text-white">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-display text-xl tracking-tight">
              MAVS <span className="text-mavs-orange">MARKETPLACE</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              {user ? (
                <>
                  <Link href="/listings/new" className="hover:text-mavs-orange transition">
                    + New listing
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-mavs-orange px-4 py-2 rounded hover:bg-orange-500 transition"
                >
                  Log in
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
