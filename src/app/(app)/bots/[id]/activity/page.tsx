"use client";

import { Suspense } from "react";
import { ActivityLog } from "@/components/app/activity-log";
import { useBotContext, useBotTitle } from "@/components/app/bot-context";
import { Skeleton } from "@/components/ui/misc";

export default function BotActivityPage() {
  const { bot, live } = useBotContext();
  useBotTitle("Activity");
  // ActivityLog reads ?type= from the URL, which needs a Suspense boundary
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
      <ActivityLog botId={bot._id} live={live} />
    </Suspense>
  );
}
