import { Context } from "koishi";
import { summarizeChatCommand } from "../utils/utils";

export class MessageHandler {

  constructor(private ctx: Context, private enabledGridIds: string[]) {
  }

  public handleMessageEvent() {
    this.ctx.middleware(async (session, next) => {
      if (!this.messageFilter(session, this.enabledGridIds)) return next();

      // store the message in the database
      await this.ctx.database.create("chat_messages", {
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

  private messageFilter(session: any, enabledGridIds: string[]): boolean {
    // not group message
    if (session.guildId === undefined) return false;
    // self message
    if (session.userId === this.ctx.bots[0].selfId) return false;
    // message is a command
    if (session.content === summarizeChatCommand) return false;
    // not enabled group
    if (!enabledGridIds.includes(session.guildId)) return false;
    return true
  }
}