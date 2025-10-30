import { GoogleGenAI, Type } from "@google/genai";
import { ArticleGenerationResult, ContentBlueprintData, Interview, RecommendedStyle, RepurposeType, StyleProfile, User } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const generateArticle = async (topic: string, interviews: Interview[], profile: StyleProfile, articleType: string): Promise<ArticleGenerationResult> => {
    const interviewContent = interviews.map(i => `Q: ${i.question}\nA: ${i.answer}`).join('\n\n');
    
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

      **Core Content (from user interview):**
      ${interviewContent}

      **Writing Style Profile:**
      - Embody this persona: **${profile.styleTemplate}**

      ${rulesSection}

      Now, write the complete, well-structured ${articleType} in Markdown format.
    `;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return {
        article: response.text,
        finalPrompt: prompt
    };
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
