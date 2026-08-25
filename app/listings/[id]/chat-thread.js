'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ChatThread({ listingId, currentUserId, otherUserId }) {
  const supabase = createClient();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, body, created_at')
        .eq('listing_id', listingId)
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true });

      if (isMounted && data) setMessages(data);
    }

    loadMessages();

    const channel = supabase
      .channel(`listing-${listingId}-${currentUserId}-${otherUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `listing_id=eq.${listingId}` },
        (payload) => {
          const m = payload.new;
          const relevant =
            (m.sender_id === currentUserId && m.receiver_id === otherUserId) ||
            (m.sender_id === otherUserId && m.receiver_id === currentUserId);
          if (relevant) setMessages((prev) => [...prev, m]);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [listingId, currentUserId, otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!body.trim()) return;

    const { error } = await supabase.from('messages').insert({
      listing_id: listingId,
      sender_id: currentUserId,
      receiver_id: otherUserId,
      body: body.trim(),
    });

    if (!error) setBody('');
  }

  return (
    <div className="border border-gray-200 rounded bg-white flex flex-col h-80">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-8">
            Say hi and ask if it's still available.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[75%] px-3 py-2 rounded text-sm ${
              m.sender_id === currentUserId
                ? 'ml-auto bg-mavs-blue text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {m.body}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="flex border-t border-gray-200">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 px-3 py-2 text-sm focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 text-sm font-semibold text-mavs-blue hover:text-mavs-navy"
        >
          Send
        </button>
      </form>
    </div>
  );
}
