"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ConsultationStatus } from "@/types";

export function useRealtimeConsultationStatus(
  consultationId: string,
  initial: ConsultationStatus
) {
  const [status, setStatus] = useState<ConsultationStatus>(initial);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`consultation:${consultationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Consultation",
          filter: `id=eq.${consultationId}`,
        },
        (payload) => setStatus(payload.new.status as ConsultationStatus)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [consultationId]);

  return status;
}
