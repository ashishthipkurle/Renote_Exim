"use client";

import CallDeskPanel from "@/components/calls/CallDeskPanel";
import { useCallController } from "@/components/session/GlobalCallProvider";

export default function ImporterCallsPage() {
	const controller = useCallController();

	return (
		<div className="h-full overflow-y-auto">
			<CallDeskPanel controller={controller} title="Importer Call Desk" />
		</div>
	);
}
