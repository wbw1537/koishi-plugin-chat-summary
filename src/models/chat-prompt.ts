export class ChatPrompt {
  public userId: string;
  public userName: string;
  public chatContent: string;

  public constructor(userId: string, userName: string, chatContent: string) {
    this.userId = userId;
    this.userName = userName;
    this.chatContent = chatContent;
  }

  public toString(): string {
    if (this.chatContent.includes("<video src")) {
      return `ID为 ${this.userId} 的 ${this.userName} 发送了一个视频`;
    } else if (this.chatContent.includes("<img src")) {
      return `ID为 ${this.userId} 的 ${this.userName} 发送了一张图片`;
    }
    return `ID为 ${this.userId} 的 ${this.userName} 说了 ${this.chatContent}`;
  }
}
