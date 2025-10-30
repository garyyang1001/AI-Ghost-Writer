import React, { useState, useEffect } from 'react';
import { StyleProfile, ArticleType, articleTypes, RecommendedStyle, User, predefinedStyles, PredefinedStyle, HumanizationConfig } from '../types';
import { Settings, Sparkles, Wand2, Loader2, BookText, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import HumanizationSettings from './HumanizationSettings';
import { defaultHumanizationConfig } from '../services/humanizeService';

interface ContentConfigProps {
  user: User | null;
  topic: string;
  initialProfile: StyleProfile;
  onStartGeneration: (profile: StyleProfile, articleType: ArticleType, humanizationConfig?: HumanizationConfig) => void;
}

type ViewState = 'config' | 'recommend_input' | 'loading_recommendations' | 'showing_recommendations' | 'loading_preview' | 'showing_preview';

const ContentConfig: React.FC<ContentConfigProps> = ({ user, topic, initialProfile, onStartGeneration }) => {
  const [profile, setProfile] = useState<StyleProfile>(initialProfile);
  const [articleType, setArticleType] = useState<ArticleType>('部落格文章');
  const [newInstruction, setNewInstruction] = useState('');
  const [humanizationConfig, setHumanizationConfig] = useState<HumanizationConfig>(defaultHumanizationConfig);
  
  const [view, setView] = useState<ViewState>('config');
  const [styleDescription, setStyleDescription] = useState('');
  const [recommendations, setRecommendations] = useState<RecommendedStyle[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [styleSample, setStyleSample] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(predefinedStyles[0].template);

  useEffect(() => {
    // Initialize profile with the first predefined style
    setProfile(p => ({ ...p, styleTemplate: predefinedStyles[0].template }));
  }, []);

  const handleInstructionAdd = () => {
    if (newInstruction.trim()) {
      setProfile(p => ({
        ...p,
        customInstructions: [...p.customInstructions, newInstruction.trim()]
      }));
      setNewInstruction('');
    }
  };

  const handleInstructionRemove = (index: number) => {
    setProfile(p => ({
      ...p,
      customInstructions: p.customInstructions.filter((_, i) => i !== index)
    }));
  };

  const handleGetRecommendations = async () => {
    if (!user || !styleDescription.trim()) return;
    setView('loading_recommendations');
    setError(null);
    try {
      const result = await api.recommendAndSampleStyles(topic, styleDescription, user);
      setRecommendations(result);
      setView('showing_recommendations');
    } catch(err) {
      setError('抱歉，推薦風格時發生錯誤，請稍後再試。');
      setView('recommend_input');
    }
  };
  
  const handleSelectStyle = (styleName: string) => {
    setProfile(p => ({...p, styleTemplate: styleName }));
    setSelectedStyle('custom'); // Indicate a custom style was selected from recommendations
    setView('config');
    setStyleSample('');
  }

  const handlePreview = async () => {
    setView('loading_preview');
    setError(null);
    setStyleSample('');
    try {
        const sample = await api.generateStyleSample(topic, profile.styleTemplate);
        setStyleSample(sample);
        setView('showing_preview');
    } catch(err) {
        setError('抱歉，預覽風格時發生錯誤，請稍後再試。');
        setView('config');
    }
  };

  const handleFinalSubmit = () => {
    onStartGeneration(profile, articleType, humanizationConfig);
  };

  const groupedStyles = predefinedStyles.reduce((acc, style) => {
    if (!acc[style.category]) {
      acc[style.category] = [];
    }
    acc[style.category].push(style);
    return acc;
  }, {} as Record<string, PredefinedStyle[]>);

  const renderRecommendationView = () => {
    // ... (This function remains largely the same but I'll paste it for completeness)
    switch(view) {
        case 'recommend_input':
          return (
            <div className="bg-indigo-50 dark:bg-gray-900 p-6 rounded-lg border border-indigo-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">描述您想要的風格</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">例如：「我希望聽起來很專業，但又帶點故事感，像 TED 演講」</p>
              <div className="mt-3 flex gap-3">
                <input
                    type="text"
                    value={styleDescription}
                    onChange={(e) => setStyleDescription(e.target.value)}
                    placeholder="請在此輸入描述..."
                    className="flex-grow p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGetRecommendations(); }}}
                />
                <button onClick={handleGetRecommendations} disabled={!styleDescription.trim()} className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:bg-indigo-400">尋找風格</button>
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          );
        case 'loading_recommendations':
          return (
            <div className="text-center p-6 bg-indigo-50 dark:bg-gray-900 rounded-lg">
              <Loader2 className="h-8 w-8 mx-auto text-indigo-500 animate-spin" />
              <p className="mt-2 text-gray-600 dark:text-gray-300">正在為您尋找最佳風格...</p>
            </div>
          );
        case 'showing_recommendations':
          return (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">這是為您推薦的風格</h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">若沒有您喜歡的風格，可點擊「返回手動設定」按鈕重新描述。</p>
              </div>
              {recommendations.map(rec => (
                <div key={rec.name} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                  <h4 className="font-bold text-indigo-600 dark:text-indigo-400">{rec.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-serif italic text-gray-700 dark:text-gray-300">"{rec.sample}"</p>
                  </div>
                  <button onClick={() => handleSelectStyle(rec.name)} className="mt-3 px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 text-sm font-medium rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800">選用此風格</button>
                </div>
              ))}
              <button onClick={() => setView('recommend_input')} className="text-sm text-gray-500 hover:underline">重新搜尋</button>
            </div>
          );
        default:
          return null;
      }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg animate-fade-in-up max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Settings className="h-12 w-12 mx-auto text-indigo-500" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">設定您的文章風格</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          最後一步！客製化您想要的內容風格與類型。
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <div>
          <label className="text-lg font-semibold text-gray-800 dark:text-gray-200">1. 選擇文章類型</label>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {articleTypes.map(type => (
              <button key={type} type="button" onClick={() => setArticleType(type)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  articleType === type 
                  ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-800' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >{type}</button>
            ))}
          </div>
        </div>

        <div>
            <label className="text-lg font-semibold text-gray-800 dark:text-gray-200">2. 選擇寫作風格</label>
            {view === 'config' || view === 'loading_preview' || view === 'showing_preview' ? (
                <div className="mt-3">
                    <select
                        value={selectedStyle}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSelectedStyle(value);
                            if (value === 'custom') {
                                setView('recommend_input');
                                setProfile(p => ({...p, styleTemplate: ''}));
                            } else {
                                setProfile(p => ({...p, styleTemplate: value}));
                            }
                            setStyleSample('');
                        }}
                        className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {Object.entries(groupedStyles).map(([category, styles]) => (
                            <optgroup label={category} key={category}>
                                {styles.map(style => (
                                <option key={style.name} value={style.template}>{style.name}</option>
                                ))}
                            </optgroup>
                        ))}
                        <optgroup label="自訂">
                            <option value="custom">自訂風格 (由 AI 推薦)...</option>
                        </optgroup>
                    </select>
                    {selectedStyle === 'custom' && (
                        <div className="mt-2 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">目前使用自訂風格：<span className="font-semibold">{profile.styleTemplate}</span></p>
                            <button type="button" onClick={() => setView('recommend_input')} className="text-sm text-indigo-600 hover:underline">修改自訂風格</button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <button type="button" onClick={() => { setView('config'); setError(null); }} className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200">
                        <ArrowLeft className="h-4 w-4" />返回預設風格
                    </button>
                    {renderRecommendationView()}
                </div>
            )}
        </div>
        
        {/* Style Preview Section */}
        {(view === 'loading_preview' || view === 'showing_preview') && (
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">風格預覽</h3>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[100px] flex items-center justify-center">
                {view === 'loading_preview' ? (
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                ) : (
                    <p className="font-serif italic text-gray-700 dark:text-gray-300">"{styleSample}"</p>
                )}
                </div>
            </div>
        )}

        {/* Humanization Settings */}
        <div>
          <label className="text-lg font-semibold text-gray-800 dark:text-gray-200">3. 去除 AI 味設定</label>
          <div className="mt-3">
            <HumanizationSettings 
              config={humanizationConfig}
              onConfigChange={setHumanizationConfig}
            />
          </div>
        </div>

        <div>
            <label className="text-lg font-semibold text-gray-800 dark:text-gray-200">4. 新增額外指示 (選填)</label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">例如：「多使用條列式清單」、「引用名人名言」。</p>
            <div className="mt-3 flex gap-3">
                <input
                    type="text" value={newInstruction} onChange={(e) => setNewInstruction(e.target.value)}
                    placeholder="新增一條指示..."
                    className="flex-grow p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleInstructionAdd(); }}}
                />
                <button type="button" onClick={handleInstructionAdd} className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium">新增</button>
            </div>
            <ul className="mt-4 space-y-2">
                {profile.customInstructions.map((inst, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-md animate-fade-in">
                        <span className="text-sm">{inst}</span>
                        <button type="button" onClick={() => handleInstructionRemove(index)} className="text-red-500 hover:text-red-700 text-xs">移除</button>
                    </li>
                ))}
            </ul>
        </div>

        <div className="pt-4 space-y-4">
          {error && <p className="text-red-500 text-sm text-center -mt-4">{error}</p>}

          {view === 'showing_preview' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setView('config'); setStyleSample(''); }}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-lg font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <RefreshCw className="h-5 w-5" /> 更換風格
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckCircle className="h-6 w-6" /> 確認風格並生成
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePreview}
              disabled={!profile.styleTemplate.trim() || view === 'loading_preview'}
              className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-md shadow-sm text-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              <Sparkles className="h-6 w-6" />
              {view === 'loading_preview' ? '預覽中...' : '預覽風格'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContentConfig;