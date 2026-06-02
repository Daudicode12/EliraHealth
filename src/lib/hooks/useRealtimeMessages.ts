"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface RealtimeMessage {
  id: string;
  consultation_id: string;
  sender_id: string;
  sender_role: string;
  message: string;
  attachment_url: string | null;
  created_at: string;
}

export function useRealtimeMessages(
  consultationId: string,
  initial: RealtimeMessage[] = []
) {
  const [messages, setMessages] = useState<RealtimeMessage[]>(initial);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`messages:${consultationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `consultation_id=eq.${consultationId}`,
        },
        (payload) =>
          setMessages((prev) => [...prev, payload.new as RealtimeMessage])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [consultationId]);

  return messages;
}
