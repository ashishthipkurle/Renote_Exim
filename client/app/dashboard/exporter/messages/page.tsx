"use client";

import { useSearchParams } from "next/navigation";

import MessagesWorkspace from "@/components/messaging/MessagesWorkspace";

export default function ExporterMessagesPage() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("user");

  return (
    <div className="h-full overflow-hidden">
      <MessagesWorkspace initialUserId={initialUserId} fullHeight={false} />
    </div>
  );
}
