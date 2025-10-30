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

export const generateStyleSample = async (topic: string, styleTemplate: string): Promise<string> => {
    const prompt = `
      As a master writer, your task is to write a short, compelling sample paragraph (around 50-75 words) on the topic of "${topic}".
      Embody this persona: **${styleTemplate}**.
      The paragraph should perfectly capture the essence of the writing style.
      Do not add any introductory or concluding remarks. Do not use markdown. Just provide the raw sample paragraph text.
    `;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
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
    
    // Anti-AI instructions for more human-like writing
    const ANTI_AI_INSTRUCTIONS = `
**重要：人性化寫作要求**

絕對禁止使用這些 AI 慣用語：
- 開頭：不要用「在當今世界」、「隨著科技發展」、「眾所周知」、「本文將探討」
- 過渡：避免「總而言之」、「值得注意的是」、「不僅如此」、「此外」、「綜上所述」
- 修飾：不用「強大的」、「革命性的」、「至關重要」、「深入探討」
- 結尾：避免「總結來說」、「最後」、「綜觀全文」

人性化寫作技巧：
1. 開頭直接切入：用行動、對話、出人意料的觀察開始
2. 段落長度要有變化：有時一句話成段，有時寫七八句
3. 每2-3個事實後，加入個人觀點或情感反應
4. 使用口語化過渡：「說實話」、「我跟你講」、「重點來了」、「有趣的是」
5. 對數據和事實加入情感反應（例如：這個數字真的讓人驚訝）
6. 每個段落至少包含一個稍微離題的想法
7. 偶爾打破格式規則來強調重點
8. 有時用「而且」或「但是」開始句子
9. 留一些想法稍微未完成...就像這樣
10. 使用括號加入旁白或補充說明（就像在跟朋友聊天）
`;
    
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

      ${ANTI_AI_INSTRUCTIONS}

      **Core Content (from user interview):**
      ${interviewContent}

      **Writing Style Profile:**
      - Embody this persona: **${profile.styleTemplate}**

      ${rulesSection}

      Now, write the complete, well-structured ${articleType} in Markdown format.
      
      記住：寫得像個真實的人，有情感、有觀點、有個性。不要寫得像機器人。
    `;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
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

export const repurposeContent = async (article: string, format: RepurposeType): Promise<string> => {
    const prompt = `
      You are a social media and content marketing expert.
      Take the following article and repurpose it into a compelling "${format}".

      **Key requirements for ${format}:**
      - **社群貼文:** Make it engaging, add emojis, and include a clear call-to-action with relevant hashtags. Keep it concise.
      - **X (推特) 推文串:** Break down the core ideas into a thread of 3-5 tweets. Each tweet must be under 280 characters. Use emojis and hashtags. The first tweet should be a hook.
      - **電子報摘要:** Write a short, personal summary for a newsletter. It should entice readers to click through to the full article.
      - **影片腳本大綱:** Create a bullet-point outline for a short (1-3 minute) video script based on the article's key points. Include suggestions for visuals.

      **Original Article:**
      """
      ${article}
      """

      Now, generate the content for the "${format}" in Markdown format.
    `;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
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

export const answerFollowUp = async (article: string, question: string): Promise<string> => {
    const prompt = `
      Given the context of the following article, provide a concise and helpful answer to the user's question.

      Article:
      """
      ${article}
      """

      Question: "${question}"

      Answer:
    `;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    return response.text;
};
