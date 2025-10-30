import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Download, RefreshCw, HelpCircle, Loader2, Share2, Twitter, Newspaper, Video, FileCode, X, Check } from 'lucide-react';
import { api } from '../services/api';
import { RepurposeType, repurposeTypes, HumanizationConfig } from '../types';
import { defaultHumanizationConfig } from '../services/humanizeService';

interface GeneratedContentProps {
  article: string;
  finalPrompt: string;
  humanizationConfig?: HumanizationConfig;
  onRestart: () => void;
}

const RepurposeIcon: React.FC<{type: RepurposeType}> = ({ type }) => {
    switch (type) {
        case '社群貼文': return <Share2 className="h-5 w-5 mr-2" />;
        case 'X (推特) 推文串': return <Twitter className="h-5 w-5 mr-2" />;
        case '電子報摘要': return <Newspaper className="h-5 w-5 mr-2" />;
        case '影片腳本大綱': return <Video className="h-5 w-5 mr-2" />;
        default: return <Share2 className="h-5 w-5 mr-2" />;
    }
}

const PromptModal: React.FC<{ prompt: string; onClose: () => void }> = ({ prompt, onClose }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold flex items-center gap-2"><FileCode className="h-5 w-5" /> AI 的完整指令</h3>
                    <div className="flex items-center gap-2">
                         <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors">
                            {copied ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4" />}
                            {copied ? '已複製！' : '複製指令'}
                         </button>
                        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
                    </div>
                </header>
                <div className="p-6 overflow-y-auto">
                    <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-md whitespace-pre-wrap break-words">
                        <code>{prompt}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
};


const GeneratedContent: React.FC<GeneratedContentProps> = ({ article, finalPrompt, humanizationConfig, onRestart }) => {
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  const [repurposeLoading, setRepurposeLoading] = useState<RepurposeType | null>(null);
  const [repurposedContent, setRepurposedContent] = useState<string | null>(null);
  const [selectedRepurposeType, setSelectedRepurposeType] = useState<RepurposeType | null>(null);


  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questions = await api.getFollowUpQuestions(article);
        setFollowUpQuestions(questions);
      } catch (error) {
        console.error("Error fetching follow-up questions:", error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, [article]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    const blob = new Blob([article], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAskQuestion = async (question: string) => {
    setCurrentQuestion(question);
    setCurrentAnswer(null);
    setIsLoadingAnswer(true);
    try {
      const answer = await api.answerFollowUp(article, question, humanizationConfig || defaultHumanizationConfig);
      setCurrentAnswer(answer);
    } catch (error) {
      console.error("Error answering follow-up question:", error);
      setCurrentAnswer("抱歉，回答問題時發生錯誤。");
    } finally {
      setIsLoadingAnswer(false);
    }
  };
  
  const handleRepurpose = async (format: RepurposeType) => {
    setRepurposeLoading(format);
    setSelectedRepurposeType(format);
    setRepurposedContent(null);
    try {
        const result = await api.repurposeContent(article, format, humanizationConfig || defaultHumanizationConfig);
        setRepurposedContent(result);
    } catch (error) {
        console.error("Error repurposing content:", error);
        setRepurposedContent("抱歉，轉換內容時發生錯誤。");
    } finally {
        setRepurposeLoading(null);
    }
  }


  return (
    <>
    {isPromptModalOpen && <PromptModal prompt={finalPrompt} onClose={() => setIsPromptModalOpen(false)} />}
    <div className="max-w-7xl mx-auto p-4 animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Article Display */}
            <div className="lg:w-2/3 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">您的傑作</h2>
                        <button onClick={() => setIsPromptModalOpen(true)} className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1">
                            <FileCode className="h-3 w-3" />
                            檢視 AI 指令
                        </button>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                        <button onClick={() => handleCopy(article)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="複製內容">
                        <Copy className="h-5 w-5" />
                        </button>
                        <button onClick={handleDownload} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="下載 MarkDown">
                        <Download className="h-5 w-5" />
                        </button>
                        <button onClick={onRestart} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm" title="產生新內容">
                        <RefreshCw className="h-4 w-4" /> 再寫一篇
                        </button>
                    </div>
                </div>
                {/* Humanization Analysis */}
                {humanizationResult && showHumanizationAnalysis && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <HumanizationSettings 
                            config={{ enabled: true, intensity: 0, logicStyle: 'spiral', verbalTics: [], personalPhrases: [], rhythmPattern: 'varied', emphasisStrategy: 'strategic', removeAIPhrases: true, addOpinions: true, varyParagraphLength: true, useConversationalTone: true }}
                            onConfigChange={() => {}}
                            humanityScore={humanizationResult.humanityScore}
                            showScore={true}
                        />
                    </div>
                )}

                {/* Original vs Humanized Toggle */}
                {humanizationResult && showOriginal && (
                    <div className="mb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                    <FileCode className="h-4 w-4" />
                                    AI 原始輸出
                                </h4>
                                <div className="prose prose-sm max-w-none dark:prose-invert text-gray-600 dark:text-gray-400">
                                    <ReactMarkdown>{humanizationResult.originalContent}</ReactMarkdown>
                                </div>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                                <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    人性化後版本
                                </h4>
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                    <ReactMarkdown>{humanizationResult.humanizedContent}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transformation Log */}
                {humanizationResult && showTransformations && (
                    <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-3 flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            變化記錄 ({humanizationResult.transformations.length} 項變更)
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {humanizationResult.transformations.map((transform, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded border border-orange-200 dark:border-orange-700">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            transform.type === 'phrase_removal' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                            transform.type === 'phrase_injection' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                            transform.type === 'structure_change' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                            transform.type === 'emphasis_added' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        }`}>
                                            {transform.type === 'phrase_removal' && '移除用語'}
                                            {transform.type === 'phrase_injection' && '添加用語'}
                                            {transform.type === 'structure_change' && '結構調整'}
                                            {transform.type === 'emphasis_added' && '強調標記'}
                                            {transform.type === 'opinion_added' && '添加觀點'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 mb-1">原文：</p>
                                            <p className="bg-gray-100 dark:bg-gray-700 p-2 rounded">{transform.original}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 mb-1">變更後：</p>
                                            <p className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded">{transform.transformed}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">{transform.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <article className="prose dark:prose-invert max-w-none prose-indigo">
                <ReactMarkdown>{article}</ReactMarkdown>
                </article>
            </div>

            {/* Follow-up Q&A */}
            <div className="lg:w-1/3">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg sticky top-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <HelpCircle className="text-indigo-500"/>
                        延伸探索
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">對內容有疑問嗎？點擊下方問題或自行提問。</p>
                    
                    <div className="mt-4 space-y-2">
                        {isLoadingQuestions ? (
                            <div className="text-center p-4">
                                <Loader2 className="h-6 w-6 mx-auto animate-spin text-indigo-500" />
                                <p className="text-sm text-gray-500 mt-2">正在產生問題...</p>
                            </div>
                        ) : (
                            followUpQuestions.map((q, i) => (
                                <button key={i} onClick={() => handleAskQuestion(q)} className="w-full text-left p-3 bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                                    {q}
                                </button>
                            ))
                        )}
                    </div>

                    {(currentQuestion || isLoadingAnswer) && (
                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{currentQuestion}</p>
                            {isLoadingAnswer ? (
                                <div className="mt-2 text-center p-4">
                                    <Loader2 className="h-6 w-6 mx-auto animate-spin text-indigo-500" />
                                </div>
                            ) : (
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{currentAnswer || ''}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {/* Repurpose Content Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">一鍵內容再利用</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">將您的核心文章轉換為適用於不同平台的格式。</p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {repurposeTypes.map(type => (
                    <button
                        key={type}
                        onClick={() => handleRepurpose(type)}
                        disabled={!!repurposeLoading}
                        className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all disabled:opacity-50"
                    >
                       {repurposeLoading === type ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RepurposeIcon type={type} />}
                       <span className="font-medium text-gray-700 dark:text-gray-200">{type}</span>
                    </button>
                ))}
            </div>
            
            {(repurposedContent || repurposeLoading) && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">轉換結果：{selectedRepurposeType}</h4>
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg relative">
                        {repurposeLoading ? (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            </div>
                        ) : (
                            <>
                                <button onClick={() => handleCopy(repurposedContent || '')} className="absolute top-2 right-2 p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full" title="複製">
                                    <Copy className="h-4 w-4" />
                                </button>
                                <div className="prose dark:prose-invert max-w-none text-sm">
                                    <ReactMarkdown>{repurposedContent || ''}</ReactMarkdown>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
    </>
  );
};

export default GeneratedContent;