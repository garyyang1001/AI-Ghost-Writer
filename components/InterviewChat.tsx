import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const INTERVIEW_COMPLETE_TOKEN = "[INTERVIEW_COMPLETE]";

interface InterviewChatProps {
  questions: string[];
  onComplete: (chatHistory: ChatMessage[]) => void;
}

const InterviewChat: React.FC<InterviewChatProps> = ({ questions, onComplete }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
      const questionList = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
      const systemInstruction = `
        You are a friendly and professional interviewer for the Word Weaver AI app. Your goal is to have a natural conversation with the user to gather their insights on a specific topic.

        **Your Task:**
        1.  Your primary goal is to get answers to the following mandatory questions:
            ${questionList}
        2.  Ask the questions one by one. Do not ask the next question until you have a reasonable answer for the current one.
        3.  **BE CONVERSATIONAL!** Do not just be a robot asking questions. You can react to user's answers, ask short follow-up clarification questions if needed.
        4.  If the user asks you a question (e.g., "What do you mean by that?"), answer it concisely and then gently guide the conversation back to the interview question.
        5.  Once you have asked ALL the mandatory questions and received answers, you MUST end your final message with the exact token: ${INTERVIEW_COMPLETE_TOKEN}. This is critical. Do not say anything after this token. For example: "Great, I have everything I need. Thank you! ${INTERVIEW_COMPLETE_TOKEN}"
      `;

      const newChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
      });

      setChat(newChat);
      // Start the conversation
      const response = await newChat.sendMessage({ message: "Let's begin the interview." });
      setMessages([{ role: 'model', text: response.text }]);
      setIsLoading(false);
    };

    initializeChat();
  }, [questions]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleUserInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !chat || isLoading || isComplete) return;

    const userMessage: ChatMessage = { role: 'user', text: userInput.trim() };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response: GenerateContentResponse = await chat.sendMessage({ message: userMessage.text });
      let modelResponseText = response.text;
      
      const updatedMessages = [...messages, userMessage];

      if (modelResponseText.includes(INTERVIEW_COMPLETE_TOKEN)) {
        modelResponseText = modelResponseText.replace(INTERVIEW_COMPLETE_TOKEN, "").trim();
        setIsComplete(true);
        const finalHistory = [...updatedMessages, { role: 'model', text: modelResponseText }];
        setMessages(finalHistory);
        setTimeout(() => onComplete(finalHistory), 2000);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: modelResponseText }]);
      }
    } catch (error) {
      console.error("Interview chat error:", error);
      const errorMessage: ChatMessage = { role: 'model', text: "抱歉，發生了錯誤，請再試一次。" };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex flex-col h-[60vh] sm:h-[70vh]">
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6">
          {messages.map((msg, index) => (
             <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-indigo-500" />
                </div>
                )}
                <div className={`rounded-lg p-3 max-w-lg shadow-sm ${msg.role === 'model' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 'bg-indigo-500 text-white'}`}>
                    <p className="text-sm">{msg.text}</p>
                </div>
                {msg.role === 'user' && (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
                )}
            </div>
          ))}
           {isLoading && (
             <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-indigo-500" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-lg">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500"/>
                </div>
            </div>
           )}
           {isComplete && (
             <div className="text-center py-4 animate-fade-in">
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">訪談完成！</p>
                <p className="text-gray-600 dark:text-gray-300">感謝您的見解，接著來設定您的文章吧。</p>
             </div>
           )}
        </div>
        <form onSubmit={handleUserInput} className="mt-4 flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
          <textarea
            rows={2}
            className="flex-grow p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder={isComplete ? "訪談已結束！" : isLoading ? "AI 正在思考..." : "請在此輸入您的回答或提問..."}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isLoading || isComplete}
            aria-label="Answer Input"
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleUserInput(e);
                }
            }}
          />
          <button
            type="submit"
            className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 transition-colors"
            disabled={!userInput.trim() || isLoading || isComplete}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default InterviewChat;