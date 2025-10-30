import React, { useState } from 'react';
import { 
  HumanizationConfig, 
  LogicStyle, 
  RhythmPattern, 
  EmphasisStrategy,
  HumanityScore 
} from '../types';
import { 
  Sparkles, 
  Settings2, 
  Info, 
  ChevronDown, 
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  AlertCircle
} from 'lucide-react';
import { defaultHumanizationConfig } from '../services/humanizeService';

interface HumanizationSettingsProps {
  config: HumanizationConfig;
  onConfigChange: (config: HumanizationConfig) => void;
  humanityScore?: HumanityScore;
  showScore?: boolean;
}

const HumanizationSettings: React.FC<HumanizationSettingsProps> = ({
  config,
  onConfigChange,
  humanityScore,
  showScore = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleToggle = () => {
    onConfigChange({
      ...config,
      enabled: !config.enabled
    });
  };

  const handleIntensityChange = (value: number) => {
    onConfigChange({
      ...config,
      intensity: value
    });
  };

  const handleLogicStyleChange = (style: LogicStyle) => {
    onConfigChange({
      ...config,
      logicStyle: style
    });
  };

  const handleRhythmPatternChange = (pattern: RhythmPattern) => {
    onConfigChange({
      ...config,
      rhythmPattern: pattern
    });
  };

  const handleEmphasisStrategyChange = (strategy: EmphasisStrategy) => {
    onConfigChange({
      ...config,
      emphasisStrategy: strategy
    });
  };

  const handleFeatureToggle = (feature: keyof HumanizationConfig) => {
    if (typeof config[feature] === 'boolean') {
      onConfigChange({
        ...config,
        [feature]: !config[feature]
      });
    }
  };

  const ScoreBar = ({ label, value }: { label: string; value: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all ${
            value >= 70 ? 'bg-green-500' : 
            value >= 40 ? 'bg-yellow-500' : 
            'bg-red-500'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-purple-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              去除 AI 味設定
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              讓文章更有人性、更自然流暢
            </p>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
        >
          {config.enabled ? (
            <>
              <ToggleRight className="h-8 w-8 text-purple-500" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">已啟用</span>
            </>
          ) : (
            <>
              <ToggleLeft className="h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">已關閉</span>
            </>
          )}
        </button>
      </div>

      {/* Humanity Score */}
      {showScore && humanityScore && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              人性化分數
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(humanityScore.overall)}
              </span>
              <span className="text-sm text-gray-500">/100</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <ScoreBar label="邏輯變化" value={humanityScore.breakdown.logicVariance} />
            <ScoreBar label="詞彙自然度" value={humanityScore.breakdown.vocabularyNaturalness} />
            <ScoreBar label="節奏變化" value={humanityScore.breakdown.rhythmVariation} />
            <ScoreBar label="情感內容" value={humanityScore.breakdown.emotionalContent} />
            <ScoreBar label="個性強度" value={humanityScore.breakdown.personalityStrength} />
          </div>

          {humanityScore.suggestions.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    改善建議
                  </p>
                  <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-0.5">
                    {humanityScore.suggestions.map((suggestion, idx) => (
                      <li key={idx}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Settings (only show if enabled) */}
      {config.enabled && (
        <div className="space-y-4">
          {/* Intensity Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                人性化強度
              </label>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {config.intensity}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.intensity}
              onChange={(e) => handleIntensityChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${config.intensity}%, #e5e7eb ${config.intensity}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>輕微調整</span>
              <span>適度優化</span>
              <span>深度改寫</span>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleFeatureToggle('removeAIPhrases')}
              className={`p-3 rounded-lg border transition-all ${
                config.removeAIPhrases
                  ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                移除 AI 慣用語
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                去除「總而言之」等制式用語
              </p>
            </button>

            <button
              onClick={() => handleFeatureToggle('addOpinions')}
              className={`p-3 rounded-lg border transition-all ${
                config.addOpinions
                  ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                加入個人觀點
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                在事實後添加主觀看法
              </p>
            </button>

            <button
              onClick={() => handleFeatureToggle('varyParagraphLength')}
              className={`p-3 rounded-lg border transition-all ${
                config.varyParagraphLength
                  ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                段落長短變化
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                打破整齊的段落結構
              </p>
            </button>

            <button
              onClick={() => handleFeatureToggle('useConversationalTone')}
              className={`p-3 rounded-lg border transition-all ${
                config.useConversationalTone
                  ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                對話式語氣
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                使用「說實話」等口語
              </p>
            </button>
          </div>

          {/* Advanced Settings Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            <Settings2 className="h-4 w-4" />
            進階設定
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
              {/* Logic Style */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  邏輯風格
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['linear', 'spiral', 'conversational', 'storytelling'] as LogicStyle[]).map(style => (
                    <button
                      key={style}
                      onClick={() => handleLogicStyleChange(style)}
                      className={`px-3 py-2 text-xs rounded-md transition-all ${
                        config.logicStyle === style
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {style === 'linear' && '線性'}
                      {style === 'spiral' && '螺旋'}
                      {style === 'conversational' && '對話'}
                      {style === 'storytelling' && '故事'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rhythm Pattern */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  節奏模式
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['uniform', 'varied', 'staccato', 'flowing'] as RhythmPattern[]).map(pattern => (
                    <button
                      key={pattern}
                      onClick={() => handleRhythmPatternChange(pattern)}
                      className={`px-3 py-2 text-xs rounded-md transition-all ${
                        config.rhythmPattern === pattern
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {pattern === 'uniform' && '統一'}
                      {pattern === 'varied' && '變化'}
                      {pattern === 'staccato' && '斷奏'}
                      {pattern === 'flowing' && '流暢'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emphasis Strategy */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  強調策略
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['minimal', 'strategic', 'emotional'] as EmphasisStrategy[]).map(strategy => (
                    <button
                      key={strategy}
                      onClick={() => handleEmphasisStrategyChange(strategy)}
                      className={`px-3 py-2 text-xs rounded-md transition-all ${
                        config.emphasisStrategy === strategy
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {strategy === 'minimal' && '最少'}
                      {strategy === 'strategic' && '策略性'}
                      {strategy === 'emotional' && '情感性'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset to Defaults */}
              <button
                onClick={() => onConfigChange(defaultHumanizationConfig)}
                className="w-full mt-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                恢復預設值
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-md">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div className="text-xs text-purple-700 dark:text-purple-300">
            <p className="font-medium mb-1">什麼是「去除 AI 味」？</p>
            <p>
              AI 寫作往往過於工整、缺乏個性。這個功能會：
              移除制式用語、加入口語化表達、變化段落節奏、
              注入個人觀點，讓文章讀起來更像真人寫的。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanizationSettings;