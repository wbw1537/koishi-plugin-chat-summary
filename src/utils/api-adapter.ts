import { Context } from "koishi";

export class ApiAdapter {
  private ctx: Context;
  private baseURL: string;
  private model: string;
  private apiKey: string[];

  constructor(ctx: Context, baseURL: string, model: string, apiKey: string[] = []) {
    this.ctx = ctx;
    this.baseURL = baseURL;
    this.model = model;
    this.apiKey = apiKey;
  }

  public async getResponse(prompt: string) {
    const payload = this.buildPayload(prompt);
    if (this.apiKey.length === 0) {
      return await this.postRequest(payload);
    } else {
      for (const apiKey of this.apiKey) {
        try {
          return await this.postRequest(payload, apiKey);
        } catch (error) {
          console.log(`请求失败: ${error}`);
        }
      }
      throw new Error("所有API请求失败");
    }

  }

  private async postRequest(payload, apiKey = undefined) {
    const url = this.buildRequestUrl(this.baseURL);
    const config = this.buildConfig(apiKey);
    try {
      const response = await this.ctx.http.post(url, payload, config);
      return response.choices[0].message.content;
    } catch (error) {
      throw new Error(`请求失败: ${error}`);
    }
  }

  private buildRequestUrl(baseURL: string) {
    return `${baseURL}/v1/chat/completions`;
  }

  private buildConfig(apiKey: string = undefined) {
    const config = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
    return config;
  }

  private buildPayload(prompt: string) {
    const requestBody = {
      model: this.model,
      messages: [
        {
          role: "user",
          content: prompt.toString()
        }
      ],
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      temperature: 0.5,
      stream: false
    }
    const parsedPayload = JSON.stringify(requestBody);
    return parsedPayload;
  }
}