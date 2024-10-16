import { Context } from "koishi"

declare module 'koishi' {
  interface Tables {
    chat_messages: ChatMessages
  }
}

export interface ChatMessages {
  id: number
  groupId: string
  userId: string
  userName: string
  chatContent: string
  sendTime: Date
  messageType: string
  replyToMessageId?: number
  isRecalled: boolean
  attachments?: any // JSON type since attachments can be various types of media
}