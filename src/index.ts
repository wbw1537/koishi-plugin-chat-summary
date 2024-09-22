import { Context, Schema } from 'koishi'
import { ChatMessages } from './types/chat-messages'

export const name = 'chat-summary'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  // Register cha_messages table in the database
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
    autoInc: true 
  })
}
