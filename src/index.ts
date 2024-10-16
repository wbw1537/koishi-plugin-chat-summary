import { Context, Schema, Session } from 'koishi'
import { ChatMessages } from './models/chat-messages'
import type { OneBotBot } from 'koishi-plugin-adapter-onebot'
import { MessageHandler } from './events/message-handler'
import { SummaryController } from './controllers/summary-controller'
import { ApiAdapter } from './utils/api-adapter'

export const inject = ['database']

export const name = 'chat-summary'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  const messageHandler = new MessageHandler(ctx)
  const apiAdapter = new ApiAdapter(ctx, "http://localhost:11434", "llama3.1:8b");
  const summaryController = new SummaryController(ctx, apiAdapter)

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

  // logic for storing and retrieving chat messages
  messageHandler.handleMessageEvent(ctx)

  summaryController.summarizeChat()
}