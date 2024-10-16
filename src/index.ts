import { Context } from 'koishi'
import { MessageHandler } from './events/message-handler'
import { SummaryController } from './controllers/summary-controller'
import { ApiAdapter } from './utils/api-adapter'
import { Config } from './utils/configs'

export const inject = ['database']

export const name = 'chat-summary'

class ChatSummary {
  private messageHandler: MessageHandler
  private apiAdapter: ApiAdapter
  private summaryController: SummaryController

  constructor(ctx: Context, public config: Config) {
    this.extendTable(ctx);
    this.messageHandler = new MessageHandler(ctx);
    this.apiAdapter = new ApiAdapter(ctx, "http://localhost:11434", "llama3.1:8b");
    this.summaryController = new SummaryController(ctx, this.apiAdapter);
    
    // logic for storing and retrieving chat messages
    this.messageHandler.handleMessageEvent(ctx)

    this.summaryController.summarizeChat()
  }

  private extendTable(ctx: Context) {
    ctx.model.extend('chat_messages', {
      id: 'unsigned',
      groupId: 'string',
      userId: 'string',
      userName: 'string',
      chatContent: 'text',
      sendTime: 'timestamp',
      messageType: 'string',
      replyToMessageId: { type: 'unsigned', nullable: true },
      isRecalled: 'boolean',
      attachments: 'json',
    }, { 
      primary: "id",
      autoInc: true 
    })
  }
}

export default ChatSummary