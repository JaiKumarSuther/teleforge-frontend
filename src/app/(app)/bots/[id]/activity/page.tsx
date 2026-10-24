"use client";

import { ActivityLog } from "@/components/app/activity-log";
import { useBotContext, useBotTitle } from "@/components/app/bot-context";

export default function BotActivityPage() {
  const { bot, live } = useBotContext();
  useBotTitle("Activity");
  return <ActivityLog botId={bot._id} live={live} />;
}
