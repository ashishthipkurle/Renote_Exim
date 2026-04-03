"use client";

import CallDeskPanel from "@/components/calls/CallDeskPanel";
import { useRealtimeCall } from "@/hooks/useRealtimeCall";

export default function ExporterCallsPage() {
  const controller = useRealtimeCall();

  return (
    <div className="h-full overflow-y-auto">
      <CallDeskPanel controller={controller} title="Exporter Call Command" />
    </div>
  );
}
