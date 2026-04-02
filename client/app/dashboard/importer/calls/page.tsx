"use client";

import CallDeskPanel from "@/components/calls/CallDeskPanel";
import { useRealtimeCall } from "@/hooks/useRealtimeCall";

export default function ImporterCallsPage() {
  const controller = useRealtimeCall();

  return (
    <div className="h-full overflow-y-auto">
      <CallDeskPanel controller={controller} title="Importer Call Desk" />
    </div>
  );
}
