export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface GenerateParams {
  system: string;
  user: string;
  maxTokens: number;
  responseFormat?: "json";
}

export interface GenerateResult {
  text: string;
  usage: TokenUsage;
}

/** Abstract AI model adapter — implement for any provider */
export interface AIAdapter {
  generate(params: GenerateParams): Promise<GenerateResult>;
  stream?(params: GenerateParams): AsyncIterable<{ delta: string }>;
}
