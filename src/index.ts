import { Context, Schema } from 'koishi'
import { MessageHandler } from './events/message-handler'
import { SummaryController } from './controllers/summary-controller'
import { ApiAdapter } from './utils/api-adapter'

export const name = 'chat-summary'

class ChatSummary {
  private messageHandler: MessageHandler
  private apiAdapter: ApiAdapter
  private summaryController: SummaryController

  constructor(ctx: Context, public config: ChatSummary.Config) {
    this.extendTable(ctx);
    this.messageHandler = new MessageHandler(ctx, config.enabledGridIds);
    this.apiAdapter = new ApiAdapter(ctx, config.baseUrl, config.model, config.apiKey);
    this.summaryController = new SummaryController(ctx, this.apiAdapter, config.enabledGridIds);
    
    // logic for storing and retrieving chat messages
    this.messageHandler.handleMessageEvent()

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

namespace ChatSummary {
  export const inject = ['database']
  
  export interface Config {
    enabledGridIds: string[];
    baseUrl: string;
    model: string;
    apiKey: string[];
  }
  export const Config: Schema<Config> = Schema.object({
    enabledGridIds: Schema.array(String).description('需要开启chat-summary的群组ID'),
    baseUrl: Schema.string().required(),
    model: Schema.string().required(),
    apiKey: Schema.array(String),
  })
}

export default ChatSummary