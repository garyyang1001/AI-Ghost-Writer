import { GoogleGenAI, Type } from "@google/genai";
import { ArticleGenerationResult, ContentBlueprintData, Interview, RecommendedStyle, RepurposeType, StyleProfile, User, HumanizationConfig, HumanizationResult } from '../types';
import { HumanizeService, defaultHumanizationConfig } from './humanizeService';

// Get API key from environment variables
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable not set. Please add your Google Gemini API key to the .env file.");
}

const ai = new GoogleGenAI({ apiKey });

const model = 'gemini-2.5-flash';

// 專家建議：動態Gemini參數映射函數
function getGeminiParams(intensity: number) {
  return {
    temperature: 0.4 + (intensity * 0.8),         // 0.4-1.2範圍：低強度穩定，高強度創意
    topP: 0.85 + (intensity * 0.1),              // 0.85-0.95範圍：確保多樣性
    topK: Math.round(20 + (intensity * 20)),      // 20-40範圍：平衡token選擇
    maxOutputTokens: 2000,
    candidateCount: 1
  };
}

// 專家建議：根據強度調整anti-AI指令強度
function getAntiAIIntensity(intensity: number): string {
  if (intensity < 0.3) {
    return `
**輕度人性化指令（強制執行）：**
- 絕對禁止：「總而言之」、「值得注意的是」、「綜上所述」、「不僅如此」
- 絕對禁止：「務實而言」、「此一策略」、「實為」等學術腔調
- 必須使用對話式開頭：「你知道嗎」、「說真的」、「我發現」
- 語調要自然親近，像朋友在聊天
`;
  } else if (intensity < 0.7) {
    return `
**中度人性化指令（強制執行）：**
- 嚴格禁止所有AI制式用語和學術語調
- 大量使用個人化表達：「我覺得」、「說實話」、「你想想看」
- 必須加入情感反應和個人觀點
- 使用不完整句子和口語化表達
- 段落長度要極度變化
- 允許使用網路用語和感嘆詞
`;
  } else {
    return `
**高強度人性化指令（嚴格執行）：**
- 寫作風格必須像真人在社群媒體上發文
- 大量使用對話式語調：「你有沒有想過」、「我跟你講一個真實的故事」
- 必須包含個人經驗和情感表達
- 允許使用「...」、「！」、「？」等情感標點
- 可以偏題、自我糾正、補充想法
- 使用短句創造衝擊力，長句展開思考
- 像在跟好朋友深談，不是在寫報告
- 偶爾可以使用網路梗和流行語
`;
  }
}

// 新增：全面的人性化指令生成器，整合所有設定參數
function getComprehensiveHumanizationInstructions(config: HumanizationConfig): string {
  if (!config.enabled) {
    return ''; // 如果未啟用，返回空指令
  }

  const intensity = config.intensity / 100;
  let instructions: string[] = [];

  // 基本強度指令
  instructions.push(getAntiAIIntensity(intensity));

  // 邏輯風格指令
  switch (config.logicStyle) {
    case 'spiral':
      instructions.push(`
**螺旋邏輯風格：**
- 不要直線式論述，而是螺旋式展開觀點
- 先提次要點，再回到主要論點
- 允許思維的迂迴和反覆`);
      break;
    case 'conversational':
      instructions.push(`
**對話邏輯風格：**
- 像和朋友聊天一樣自然
- 時不時加入括號內的補充想法
- 允許適度偏題和回到主題`);
      break;
    case 'storytelling':
      instructions.push(`
**故事邏輯風格：**
- 用敘事的方式展開論點
- 在段落間加入引人入勝的過渡
- 創造情節張力和期待感`);
      break;
  }

  // 節奏模式指令
  switch (config.rhythmPattern) {
    case 'staccato':
      instructions.push(`
**斷奏節奏：**
- 使用短句和短段落
- 創造急促、有力的節拍感
- 避免冗長的說明`);
      break;
    case 'flowing':
      instructions.push(`
**流暢節奏：**
- 使用較長的句子和段落
- 創造綿延不斷的閱讀流
- 善用連接詞串聯想法`);
      break;
    case 'varied':
      instructions.push(`
**變化節奏：**
- 交替使用長短句和段落
- 創造音樂般的節奏變化
- 用短句強調，用長句展開`);
      break;
  }

  // 強調策略指令
  switch (config.emphasisStrategy) {
    case 'strategic':
      instructions.push(`
**策略性強調：**
- 只強調真正重要的概念
- 使用**粗體**突出關鍵詞
- 避免過度強調造成視覺疲勞`);
      break;
    case 'emotional':
      instructions.push(`
**情感性強調：**
- 用強調表達情感和態度
- 多使用感嘆號和省略號
- 讓讀者感受到寫作者的情緒`);
      break;
  }

  // 自定義短語指令
  if (config.verbalTics.length > 0) {
    instructions.push(`
**使用這些口語習慣：**
${config.verbalTics.map(phrase => `- "${phrase}"`).join('\n')}`);
  }

  if (config.personalPhrases.length > 0) {
    instructions.push(`
**融入這些個人用語：**
${config.personalPhrases.map(phrase => `- "${phrase}"`).join('\n')}`);
  }

  // 功能開關指令
  const features: string[] = [];
  if (config.removeAIPhrases) {
    features.push('- 徹底避免AI常用的過渡詞和修飾語');
  }
  if (config.addOpinions) {
    features.push('- 在陳述事實後加入個人看法和觀點');
  }
  if (config.varyParagraphLength) {
    features.push('- 刻意變化段落長度，創造視覺和閱讀韻律');
  }
  if (config.useConversationalTone) {
    features.push('- 使用對話式語調，像是在和讀者面對面交流');
  }

  if (features.length > 0) {
    instructions.push(`
**額外要求：**
${features.join('\n')}`);
  }

  return instructions.filter(instruction => instruction.trim()).join('\n\n');
}

// This is a helper function to call the API and parse the JSON response.
async function generateAndParseJson<T>(prompt: string, schema: any): Promise<T> {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });
  
  try {
    const jsonText = response.text.trim();
    // The Gemini API can sometimes return the JSON wrapped in markdown backticks.
    const cleanJson = jsonText.replace(/^```json\n?/, '').replace(/```$/, '');
    return JSON.parse(cleanJson) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", response.text);
    throw new Error("Invalid JSON response from API.");
  }
}

export const generateBlueprint = async (goal: string, user: User): Promise<ContentBlueprintData> => {
  const prompt = `
    As a content strategist, create a content blueprint for a user named "${user.name}" who wants to achieve the following goal: "${goal}".
    The blueprint should include one main "pillar content" topic and a list of 3-5 related "cluster topics".
    Pillar content should be a comprehensive, in-depth piece. Cluster topics should be shorter, more specific articles that link back to the pillar content.
    Respond in JSON format.
  `;
  const schema = {
    type: Type.OBJECT,
    properties: {
      pillarContent: { type: Type.STRING, description: "The main pillar content topic." },
      clusterTopics: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of related cluster topics."
      },
    },
    required: ["pillarContent", "clusterTopics"],
  };
  return generateAndParseJson<ContentBlueprintData>(prompt, schema);
};

export const getInterviewQuestions = async (topic: string): Promise<string[]> => {
  const prompt = `
    You are an expert interviewer. Generate a list of 5 insightful and open-ended interview questions to gather information about the topic: "${topic}".
    These questions will be asked to a user to help them provide the core information for an article. The questions should be designed to extract key insights, personal experiences, and valuable details.
    Respond with a JSON array of strings, where each string is a question.
  `;
  const schema = {
    type: Type.ARRAY,
    items: { type: Type.STRING },
    description: "A list of 5 interview questions."
  };
  return generateAndParseJson<string[]>(prompt, schema);
};

export const recommendAndSampleStyles = async (topic: string, description: string, user: User): Promise<RecommendedStyle[]> => {
    const prompt = `
      A user named "${user.name}" is writing about "${topic}" and described their desired writing style as: "${description}".
      Based on this, recommend 3 distinct writing style templates. For each style, provide a name, a brief description, and a short, compelling sample paragraph (around 50 words) as if writing about the topic.
      Respond in JSON format.
    `;

    const styleSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The name of the writing style." },
            description: { type: Type.STRING, description: "A brief description of the style." },
            sample: { type: Type.STRING, description: "A sample paragraph in this style." },
        },
        required: ["name", "description", "sample"],
    };

    const schema = {
        type: Type.ARRAY,
        items: styleSchema
    };

    return generateAndParseJson<RecommendedStyle[]>(prompt, schema);
};

export const generateStyleSample = async (topic: string, styleTemplate: string, humanizationConfig?: HumanizationConfig): Promise<string> => {
    // 獲取人性化指令（如果提供配置）
    const humanizationInstructions = humanizationConfig?.enabled 
      ? getComprehensiveHumanizationInstructions(humanizationConfig)
      : `
**反AI指令（強制執行）：**
- 完全避免「總而言之」、「值得注意的是」、「綜上所述」等AI用語
- 不要使用「務實而言」、「此一策略」等學術腔調
- 寫得像真人，有個性、有情感
- 使用對話式語調，如「說實話」、「其實」、「你知道嗎」
`;

    const prompt = `
      As a master writer, your task is to write a short, compelling sample paragraph (around 50-75 words) on the topic of "${topic}".
      
      ${humanizationInstructions}
      
      Embody this persona: **${styleTemplate}**.
      The paragraph should perfectly capture the essence of the writing style while sounding natural and human.
      Do not add any introductory or concluding remarks. Do not use markdown. Just provide the raw sample paragraph text.
      
      重要：這個範例要讓人感覺是真人寫的，不是AI生成的！
    `;
    
    // 使用動態參數
    const intensity = humanizationConfig?.enabled ? humanizationConfig.intensity / 100 : 0.7;
    const geminiParams = getGeminiParams(intensity);
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      generationConfig: {
        temperature: geminiParams.temperature,
        topP: geminiParams.topP,
        topK: geminiParams.topK,
        maxOutputTokens: 200, // 短範例
        candidateCount: geminiParams.candidateCount
      }
    });
    return response.text;
};

export const generateArticle = async (
  topic: string, 
  interviews: Interview[], 
  profile: StyleProfile, 
  articleType: string,
  humanizationConfig?: HumanizationConfig
): Promise<ArticleGenerationResult> => {
    const interviewContent = interviews.map(i => `Q: ${i.question}\nA: ${i.answer}`).join('\n\n');
    
    // 使用全面的人性化指令生成器
    const HUMANIZATION_INSTRUCTIONS = humanizationConfig 
      ? getComprehensiveHumanizationInstructions(humanizationConfig)
      : getAntiAIIntensity(0.5); // 未提供配置時使用預設中等強度
    
    const rulesSection = profile.customInstructions.length > 0
        ? `
**MANDATORY WRITING RULES CHECKLIST:**
Before you begin, confirm you will strictly follow these rules:
${profile.customInstructions.map((rule, index) => `- Rule ${index + 1}: ${rule}`).join('\n')}

After writing, you MUST review your article to ensure all rules have been met.
`
        : 'There are no special rules for this article.';

    const prompt = `
      As a master writer, your task is to craft a compelling ${articleType} on the topic of "${topic}".
      You will act as a ghostwriter, embodying the user's chosen style.

      ${HUMANIZATION_INSTRUCTIONS}

      **Core Content (from user interview):**
      ${interviewContent}

      **Writing Style Profile:**
      - Embody this persona: **${profile.styleTemplate}**

      ${rulesSection}

      Now, write the complete, well-structured ${articleType} in Markdown format.
      
      **🚨 最終反AI檢查清單（嚴格執行）：**
      1. 絕對禁止使用：「總而言之」、「值得注意的是」、「務實而言」、「此一策略」、「實為」
      2. 必須使用對話式語調，像真人在社群媒體發文
      3. 必須加入個人觀點：「我覺得」、「說實話」、「你想想看」
      4. 必須有情感表達：使用「！」、「？」、「...」
      5. 段落長度要極度變化，有短有長
      6. 像朋友在聊天，不是學者在演講
      
      🎯 檢驗標準：如果讀起來像AI寫的，就重寫！要像真人寫的！
    `;
    
    // 專家建議：使用動態Gemini參數
    const intensity = humanizationConfig?.enabled ? humanizationConfig.intensity / 100 : 0.5;
    const geminiParams = getGeminiParams(intensity);
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      generationConfig: {
        temperature: geminiParams.temperature,
        topP: geminiParams.topP,
        topK: geminiParams.topK,
        maxOutputTokens: geminiParams.maxOutputTokens,
        candidateCount: geminiParams.candidateCount
      }
    });
    
    let finalArticle = response.text;
    
    // Apply humanization if config provided
    if (humanizationConfig && humanizationConfig.enabled) {
      const humanizeService = new HumanizeService(humanizationConfig);
      const humanizationResult = await humanizeService.humanize(finalArticle);
      finalArticle = humanizationResult.humanizedContent;
    }
    
    return {
        article: finalArticle,
        finalPrompt: prompt
    };
};

// New function to get humanized article with transformation details
export const generateHumanizedArticle = async (
  topic: string,
  interviews: Interview[],
  profile: StyleProfile,
  articleType: string,
  humanizationConfig?: HumanizationConfig
): Promise<ArticleGenerationResult & { humanizationResult?: HumanizationResult }> => {
  const config = humanizationConfig || defaultHumanizationConfig;
  const result = await generateArticle(topic, interviews, profile, articleType, config);
  
  // Also return the detailed humanization result if needed
  if (config.enabled) {
    const humanizeService = new HumanizeService(config);
    const originalResponse = await ai.models.generateContent({
      model,
      contents: result.finalPrompt,
    });
    const humanizationResult = await humanizeService.humanize(originalResponse.text);
    
    return {
      ...result,
      humanizationResult
    };
  }
  
  return result;
};

export const repurposeContent = async (article: string, format: RepurposeType, humanizationConfig?: HumanizationConfig): Promise<string> => {
    // 獲取人性化指令
    const humanizationInstructions = humanizationConfig?.enabled 
      ? getComprehensiveHumanizationInstructions(humanizationConfig)
      : `
**反AI指令（強制執行）：**
- 避免AI制式用語如「總而言之」、「值得注意的是」
- 寫得自然、有個性，像真人的語調
- 加入適當的情感和個人觀點
- 使用對話式表達，不要過於正式
`;

    const prompt = `
      You are a social media and content marketing expert.
      Take the following article and repurpose it into a compelling "${format}".
      
      ${humanizationInstructions}

      **Key requirements for ${format}:**
      - **社群貼文:** Make it engaging, add emojis, and include a clear call-to-action with relevant hashtags. Keep it concise and natural.
      - **X (推特) 推文串:** Break down the core ideas into a thread of 3-5 tweets. Each tweet must be under 280 characters. Use emojis and hashtags. The first tweet should be a hook. Sound conversational.
      - **電子報摘要:** Write a short, personal summary for a newsletter. It should entice readers to click through to the full article. Write like a friend recommending content.
      - **影片腳本大綱:** Create a bullet-point outline for a short (1-3 minute) video script based on the article's key points. Include suggestions for visuals. Keep the tone natural and engaging.

      **Original Article:**
      """
      ${article}
      """

      Now, generate the content for the "${format}" in Markdown format.
      重要：輸出要自然、有人味，不要像AI生成的！
    `;
    
    // 使用動態參數
    const intensity = humanizationConfig?.enabled ? humanizationConfig.intensity / 100 : 0.6;
    const geminiParams = getGeminiParams(intensity);
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        generationConfig: {
          temperature: geminiParams.temperature,
          topP: geminiParams.topP,
          topK: geminiParams.topK,
          maxOutputTokens: geminiParams.maxOutputTokens,
          candidateCount: geminiParams.candidateCount
        }
    });
    return response.text;
};


export const getFollowUpQuestions = async (article: string): Promise<string[]> => {
    const prompt = `
      Based on the following article, generate 3 insightful follow-up questions a reader might have.
      The questions should encourage deeper exploration of the topic.
      Respond with a JSON array of 3 question strings.

      Article:
      """
      ${article}
      """
    `;

    const schema = {
        type: Type.ARRAY,
        items: { type: Type.STRING }
    };
    
    return generateAndParseJson<string[]>(prompt, schema);
};

export const answerFollowUp = async (article: string, question: string, humanizationConfig?: HumanizationConfig): Promise<string> => {
    // 獲取人性化指令
    const humanizationInstructions = humanizationConfig?.enabled 
      ? getComprehensiveHumanizationInstructions(humanizationConfig)
      : `
**反AI指令（強制執行）：**
- 不要使用「基於上述內容」、「根據文章所述」等AI開頭
- 直接回答問題，像真人對話一樣自然
- 可以說「我覺得」、「說實話」等個人化表達
- 避免過於正式的學術語調
`;

    const prompt = `
      Given the context of the following article, provide a concise and helpful answer to the user's question.
      
      ${humanizationInstructions}

      Article:
      """
      ${article}
      """

      Question: "${question}"

      Answer the question in a natural, conversational way as if you're having a friendly discussion. Be helpful but human.
      重要：回答要自然，像真人在聊天，不要有AI味！
      
      Answer:
    `;
    
    // 使用動態參數
    const intensity = humanizationConfig?.enabled ? humanizationConfig.intensity / 100 : 0.6;
    const geminiParams = getGeminiParams(intensity);
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        generationConfig: {
          temperature: geminiParams.temperature,
          topP: geminiParams.topP,
          topK: geminiParams.topK,
          maxOutputTokens: 500, // 回答不需要太長
          candidateCount: geminiParams.candidateCount
        }
    });
    return response.text;
};
