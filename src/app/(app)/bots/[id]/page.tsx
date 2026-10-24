"use client";

import { useBotContext, useBotTitle } from "@/components/app/bot-context";
import { Conversations } from "@/components/app/conversations";

export default function BotConversationsPage() {
  const { bot, live, status } = useBotContext();
  useBotTitle("Conversations");
  return <Conversations botId={bot._id} live={live} status={status} username={bot.telegramBotInfo.username} />;
}
