import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, price, category, image_url, created_at, status')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-mavs-navy">The Board</h1>
        <p className="text-gray-600 mt-1">
          Bought and sold by Mavericks, for Mavericks.
        </p>
      </div>

      {!user && (
        <div className="mb-8 bg-white border-2 border-dashed border-mavs-blue/40 rounded p-4 text-sm">
          <Link href="/login" className="text-mavs-blue font-semibold underline">
            Log in with your @mavs.uta.edu email
          </Link>{' '}
          to post a listing or message a seller.
        </div>
      )}

      {(!listings || listings.length === 0) && (
        <div className="text-center py-20 text-gray-500">
          <p className="font-display text-xl text-mavs-navy mb-2">Nothing posted yet</p>
          <p>Be the first Maverick to list something.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {listings?.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="listing-card relative bg-white rounded shadow-md p-4 border border-gray-200"
          >
            <span className="pin" />
            <div className="aspect-square bg-mavs-cream rounded mb-3 overflow-hidden flex items-center justify-center">
              {listing.image_url ? (
                <Image
                  src={listing.image_url}
                  alt={listing.title}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-4xl">📦</span>
              )}
            </div>
            <p className="text-xs uppercase tracking-wide text-mavs-orange font-semibold">
              {listing.category}
            </p>
            <h2 className="font-semibold text-mavs-navy truncate">{listing.title}</h2>
            <p className="text-lg font-display text-mavs-blue mt-1">
              ${Number(listing.price).toFixed(2)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
