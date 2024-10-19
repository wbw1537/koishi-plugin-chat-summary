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
    + "你需要着重关注这些内容中具有上下文交流、联系的部分，适当舍弃那些你无法理解或缺乏意义的内容\n"
    + "我无法告诉你聊天中图片或视频的内容，如你发现聊天记录中人们针对图片或视频发起了讨论，你可以适当猜测\n"
    + "我需要你根据上面的要求阅读并且以下内容，然后完成我的任务。\n";
  private summarizePrompt: string = 
    "\n请用中文为我总结以上聊天内容，\n"
    + "我的本意是将聊天记录总结出一个报告，不希望没有参与讨论的人们错过某些重要信息\n"
    + "如果你认为这段聊天内容没有意义，请回复“你们往群里灌水就别叫我出来总结了”\n";

  constructor(
    private ctx: Context, 
    private apiAdapter: ApiAdapter, 
    private enabledGridIds: string[]) {
  }

  public async summarizeChat() {
    this.ctx.command("chat-summary", "总结你的群聊")
      .option('timeDuration', '-t <timeDuration:number> 指定时间范围，单位为小时', { fallback: 12 })
      .option('user', '-u <user:user> 指定用户，请直接@', { fallback: undefined })
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