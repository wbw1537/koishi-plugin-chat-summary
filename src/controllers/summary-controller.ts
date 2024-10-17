import { Context } from "koishi";
import { ChatPrompt } from "../models/chat-prompt";
import { ApiAdapter } from "../utils/api-adapter";


export class SummaryController {
  private systemPrompt: string =
    "接下来我会为你提供一段记录的聊天内容，其格式为：\n"
    + "ID为 {userId} 的 {userName} 说了 {chatContent}\n"
    + "如果是图片或视频，格式为：\n"
    + "ID为 {userId} 的 {userName} 发送了一张图片\n"
    + "ID为 {userId} 的 {userName} 发送了一个视频\n"
    + "我需要你阅读并理解这些内容，然后完成我的任务。\n";
  private summarizePrompt: string = "\n请用中文为我总结以上聊天内容";


  constructor(
    private ctx: Context, 
    private apiAdapter: ApiAdapter, 
    private enabledGridIds: string[]) {
  }

  public async summarizeChat() {
    this.ctx.command("chat-summary")
      .option('timeDuration', '-t <timeDuration:number>', { fallback: 12})
      .option('user', '-u <user:user>', { fallback: undefined })
      .action(async ({ session, options }) => {
        console.log("t:", options.timeDuration, "u:", options.user);
        if (!this.enabledGridIds.includes(session.guildId)) {
          console.log("[chat-summary] Chat summary is only enabled for these groups: ", this.enabledGridIds);
          session.send("当前群组未开启chat-summary");
          return;
        }
        // select chat messages
        const chatPrompts = await this.selectChatMessages(session.guildId, options.timeDuration, options.user);
        // send the system prompt
        const prompts = this.systemPrompt + chatPrompts.join("\n") + this.summarizePrompt;
        console.log("[chat-summary] Start summarizing chat messages within the last ", options.timeDuration, " hours");
        if (options.user) {
          console.log("[chat-summary] User: ", options.user);
        }
        const result = await this.apiAdapter.getResponse(prompts);
        session.send(result);
      })
  }

  private async selectChatMessages(groupId: string, timeRange: any, user: string): Promise<string[]> {
    const messages = user ?
      await this.selectChatMessageByTimeRangeAndUser(groupId, timeRange, user) :
      await this.selectChatMessageByTimeRange(groupId, timeRange);
    const chatPrompts = messages.map((message) => {
      const chatPrompt = new ChatPrompt(
        message.userId, message.userName, message.chatContent).toString();
      return chatPrompt
    });
    return chatPrompts
  }

  private async selectChatMessageByTimeRange(groupId: string, timeRange: any) {
    return await this.ctx.database.get("chat_messages", {
      groupId: groupId,
      sendTime: {
        $gte: new Date(Date.now() - timeRange * 60 * 60 * 1000)
      },
    });
  };

  private async selectChatMessageByTimeRangeAndUser(groupId: string, timeRange: any, user: string) {
    // get the substring of the user id
    // user format: {platform}:{id}
    const userId = user.substring(user.indexOf(":") + 1)
    return await this.ctx.database.get("chat_messages", {
      groupId: groupId,
      userId: userId,
      sendTime: {
        $gte: new Date(Date.now() - timeRange * 60 * 60 * 1000)
      },
    });
  }
}