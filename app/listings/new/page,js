import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ChatThread from './chat-thread';

export default async function ListingDetailPage({ params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, description, price, category, image_url, seller_id, created_at')
    .eq('id', params.id)
    .single();

  if (!listing) notFound();

  const { data: seller } = await supabase
    .from('profiles')
    .select('display_name, email')
    .eq('id', listing.seller_id)
    .single();

  const isOwner = user?.id === listing.seller_id;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="aspect-square bg-white rounded shadow-md overflow-hidden flex items-center justify-center border border-gray-200">
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.title}
            width={500}
            height={500}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-6xl">📦</span>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-mavs-orange font-semibold">
          {listing.category}
        </p>
        <h1 className="font-display text-2xl text-mavs-navy mt-1">{listing.title}</h1>
        <p className="text-2xl font-display text-mavs-blue mt-2">
          ${Number(listing.price).toFixed(2)}
        </p>
        <p className="text-gray-700 mt-4 whitespace-pre-line">{listing.description}</p>
        <p className="text-sm text-gray-500 mt-4">
          Listed by {seller?.display_name || 'a Maverick'}
        </p>

        {!isOwner && user && (
          <div className="mt-8">
            <h2 className="font-semibold text-mavs-navy mb-2">Message the seller</h2>
            <ChatThread
              listingId={listing.id}
              currentUserId={user.id}
              otherUserId={listing.seller_id}
            />
          </div>
        )}

        {!user && (
          <p className="mt-8 text-sm text-gray-600">
            <a href="/login" className="text-mavs-blue underline font-semibold">
              Log in
            </a>{' '}
            to message this seller.
          </p>
        )}

        {isOwner && (
          <p className="mt-8 text-sm text-gray-500 italic">
            This is your listing. Messages from interested buyers will appear per-buyer chat threads (coming next iteration — for now check back on this page).
          </p>
        )}
      </div>
    </div>
  );
}
