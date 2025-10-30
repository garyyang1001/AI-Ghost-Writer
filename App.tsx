import React, { useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { User, ContentBlueprintData, Interview, StyleProfile, ArticleType, ChatMessage, HumanizationConfig } from './types';
import { api } from './services/api';

import Auth from './components/Auth';
import GoalInput from './components/GoalInput';
import ContentBlueprint from './components/ContentBlueprint';
import TopicInput from './components/TopicInput';
import InterviewChat from './components/InterviewChat';
import ContentConfig from './components/ContentConfig';
import GeneratedContent from './components/GeneratedContent';
import LoadingIndicator from './components/LoadingIndicator';
import ChatBot from './components/ChatBot';

import { BrainCircuit, PenTool, FileText, Bot } from 'lucide-react';

type AppState =
  | 'AUTH'
  | 'GOAL_INPUT'
  | 'GENERATING_BLUEPRINT'
  | 'SHOWING_BLUEPRINT'
  | 'TOPIC_INPUT' // Fallback if blueprint is skipped
  | 'GENERATING_QUESTIONS'
  | 'INTERVIEW'
  | 'CONTENT_CONFIG'
  | 'GENERATING_ARTICLE'
  | 'SHOWING_ARTICLE';


function App() {
  const [user, setUser] = useLocalStorage<User | null>('word-weaver-user', null);
  const [appState, setAppState] = useState<AppState>('AUTH');
  
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  const [blueprint, setBlueprint] = useState<ContentBlueprintData | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [styleProfile, setStyleProfile] = useLocalStorage<StyleProfile>('word-weaver-style-profile', {
    styleTemplate: '專業且引人入勝',
    customInstructions: [],
  });
  const [article, setArticle] = useState('');
  const [finalPrompt, setFinalPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (name: string) => {
    const newUser = { name };
    setUser(newUser);
    setAppState('GOAL_INPUT');
  };
  
  const handleGoalSubmit = async (submittedGoal: string) => {
    if (!user) return;
    setGoal(submittedGoal);
    setAppState('GENERATING_BLUEPRINT');
    setError(null);
    try {
      const bp = await api.generateBlueprint(submittedGoal, user);
      setBlueprint(bp);
      setAppState('SHOWING_BLUEPRINT');
    } catch (err) {
      console.error(err);
      setError('無法生成內容藍圖，請稍後再試或直接輸入主題。');
      setAppState('TOPIC_INPUT'); // Fallback
    }
  };

  const handleTopicSelect = async (selectedTopic: string) => {
    setTopic(selectedTopic);
    setAppState('GENERATING_QUESTIONS');
    setError(null);
    try {
      const questions = await api.getInterviewQuestions(selectedTopic);
      setInterviewQuestions(questions);
      setAppState('INTERVIEW');
    } catch (err) {
      console.error(err);
      setError('無法生成訪談問題，請稍後再試。');
      setAppState('TOPIC_INPUT');
    }
  };

  const handleInterviewComplete = (chatHistory: ChatMessage[]) => {
    // Parse chat history to create Q&A pairs for the article generation
    const qaPairs: Interview[] = [];
    for (let i = 0; i < chatHistory.length - 1; i++) {
        if (chatHistory[i].role === 'model' && chatHistory[i+1].role === 'user') {
           // Simple pairing: assumes user answer always follows a model question.
           // This might need more robust logic if conversations become more complex.
           const questionText = chatHistory[i].text;
           // Filter out clarification answers from the main Q&A
           if (interviewQuestions.some(q => questionText.includes(q))) {
                qaPairs.push({
                    question: questionText,
                    answer: chatHistory[i+1].text
                });
           }
        }
    }
    setInterviews(qaPairs);
    setAppState('CONTENT_CONFIG');
  };

  const handleStartGeneration = async (profile: StyleProfile, articleType: ArticleType, humanizationConfig?: HumanizationConfig) => {
    setStyleProfile(profile);
    setAppState('GENERATING_ARTICLE');
    try {
      const result = await api.generateArticle(topic, interviews, profile, articleType, humanizationConfig);
      setArticle(result.article);
      setFinalPrompt(result.finalPrompt);
      setAppState('SHOWING_ARTICLE');
    } catch (err) {
      console.error(err);
      setError('生成文章時發生錯誤，請稍後再試。');
      setAppState('CONTENT_CONFIG');
    }
  };

  const handleReset = () => {
    setUser(null);
    setAppState('AUTH');
    setTopic('');
    setGoal('');
    setBlueprint(null);
    setInterviewQuestions([]);
    setInterviews([]);
    setArticle('');
    setFinalPrompt('');
    setError(null);
  };
  
  const handleResetBlueprint = () => {
    setBlueprint(null);
    setAppState('GOAL_INPUT');
  }

  const renderContent = () => {
    if (!user) {
      return <Auth onLogin={handleLogin} />;
    }

    switch (appState) {
      case 'GOAL_INPUT':
        return <GoalInput onStart={handleGoalSubmit} error={error} />;
      case 'GENERATING_BLUEPRINT':
        return <LoadingIndicator title="正在規劃您的內容策略..." messages={['分析您的目標...', '尋找核心主題...', '建立主題集群...']} icon={<BrainCircuit className="h-10 w-10 text-indigo-500" />} />;
      case 'SHOWING_BLUEPRINT':
        return blueprint && <ContentBlueprint blueprint={blueprint} onSelectTopic={handleTopicSelect} onReset={handleResetBlueprint} />;
      case 'TOPIC_INPUT':
        return <TopicInput onStart={handleTopicSelect} error={error} />;
      case 'GENERATING_QUESTIONS':
        return <LoadingIndicator title="正在準備訪談..." messages={['設計深入的問題...', '確保問題的開放性...', '為您量身打造...']} icon={<PenTool className="h-10 w-10 text-indigo-500" />} />;
      case 'INTERVIEW':
        return <InterviewChat questions={interviewQuestions} onComplete={handleInterviewComplete} />;
      case 'CONTENT_CONFIG':
        return <ContentConfig user={user} topic={topic} initialProfile={styleProfile} onStartGeneration={handleStartGeneration} />;
      case 'GENERATING_ARTICLE':
        return <LoadingIndicator title="正在編織您的文章..." messages={['融合您的見解...', '套用寫作風格...', '進行最後潤飾...', '即將完成！']} icon={<FileText className="h-10 w-10 text-indigo-500" />} />;
      case 'SHOWING_ARTICLE':
        return <GeneratedContent article={article} finalPrompt={finalPrompt} onRestart={handleReset} />;
      default:
        return <Auth onLogin={handleLogin} />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-sans transition-colors">
      <header className="py-4 px-6 sm:px-8 shadow-sm bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Word Weaver <span className="text-indigo-500">AI</span></h1>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">歡迎, {user.name}</span>
              <button onClick={handleReset} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200">重新開始</button>
            </div>
          )}
        </div>
      </header>
      <main className="py-8 sm:py-12 px-4 sm:px-6">
        {renderContent()}
      </main>
      {user && appState !== 'SHOWING_ARTICLE' && <ChatBot />}
    </div>
  );
}

export default App;