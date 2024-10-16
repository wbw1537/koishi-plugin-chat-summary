import { Context } from "koishi";
import { summarizeChatCommand } from "../utils/utils";

export class MessageHandler {
  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  public handleMessageEvent(ctx: Context) {
    ctx.on("message", async (session) => {
      if (!this.messageFilter(session)) return;

      // store the message in the database
      await ctx.database.create("chat_messages", {
        groupId: session.guildId,
        userId: session.userId,
        userName: session.username,
        chatContent: session.content,
        sendTime: new Date(session.timestamp),
        messageType: session.type,
        isRecalled: false,
      })
    })
  }

  private messageFilter(session: any): boolean {
    // not group message
    if (session.guildId === undefined) return false;
    // self message
    if (session.userId === this.ctx.bots[0].selfId) return false;
    // message is a command
    if (session.content === summarizeChatCommand) return false;
    return true
  }
}