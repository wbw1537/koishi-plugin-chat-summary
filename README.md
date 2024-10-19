# koishi-plugin-chat-summary

[![npm](https://img.shields.io/npm/v/koishi-plugin-chat-summary?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-chat-summary)

这是一个用于总结你的聊天记录的koishi插件

**注意：插件目前处于早期版本，在数据处理上稍有缺陷，只使用了一个adapter的koishi用户可以放心使用**
## 命令

### chat-summary
```chat-summary```命令具有两个可选参数，无参默认值为总结12小时内所有群成员发言。
* ```-t```用于指定用于总结聊天记录的时间范畴，单位为小时。
* ```-u```用于指定某个用户的消息，```at``` 元素或者 ```@{platform}:{id}``` 的格式。

Example：总结12小时内用户名为 *我是早濑优香* 的用户发言
```bash
chat-summary -t 12 -u @我是早濑优香
```

## 消息存储 
目前使用数据库进行聊天记录的存储，后续会进行重构。
```typescript
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
```
## 总结生成
目前的System Prompt：
```typescript
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
```