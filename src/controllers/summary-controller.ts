import { Context } from "koishi";
import { ChatPrompt } from "../models/chat-prompt";
import { ApiAdapter } from "../utils/api-adapter";


export class SummaryController {
    private ctx: Context;
    private apiAdapter: ApiAdapter;
    private systemPrompt: string = 
        "接下来我会为你提供一段记录的聊天内容，其格式为：\n"
        + "ID为 {userId} 的 {userName} 说了 {chatContent}\n"
        + "如果是图片或视频，格式为：\n"
        + "ID为 {userId} 的 {userName} 发送了一张图片\n"
        + "ID为 {userId} 的 {userName} 发送了一个视频\n"
        + "我需要你阅读并理解这些内容，然后完成我的任务。\n";
    private summarizePrompt: string = "\n请用中文为我总结以上聊天内容";


    constructor(ctx: Context, apiAdapter: ApiAdapter) {
        this.ctx = ctx;
        this.apiAdapter = apiAdapter;
    }

    public async summarizeChat() {
        this.ctx.command("chat-summary")
        .action(async ({ session }) => {
            // select chat messages
            const chatPrompts = await this.selectChatMessages(session.guildId, 8);
            // send the system prompt
            const prompts = this.systemPrompt + chatPrompts.join("\n") + this.summarizePrompt;
            const result = await this.apiAdapter.getResponse(prompts);
            session.send(result);
        })
    }

    private async selectChatMessages(groupId: string, timeRange: number) {
        const messages = await this.ctx.database.get("chat_messages", {
            groupId: groupId,
            sendTime: {
                $gte: new Date(Date.now() - timeRange * 60 * 60 * 1000)
            }
        })
        const chatPrompts = messages.map((message) => {
            const chatPrompt = new ChatPrompt(
                message.userId, message.userName, message.chatContent).toString();
            return chatPrompt
        });
        return chatPrompts
    }
}