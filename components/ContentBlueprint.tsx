import React from 'react';
import { ContentBlueprintData } from '../types';
import { Map, Zap, BookOpen, RefreshCw } from 'lucide-react';

interface ContentBlueprintProps {
  blueprint: ContentBlueprintData;
  onSelectTopic: (topic: string) => void;
  onReset: () => void;
}

const ContentBlueprint: React.FC<ContentBlueprintProps> = ({ blueprint, onSelectTopic, onReset }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg animate-fade-in-up max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <Map className="h-12 w-12 mx-auto text-indigo-500" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">您的內容藍圖</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          這是 AI 為您規劃的內容策略。點擊任一主題即可開始寫作。
        </p>
      </div>

      <div className="flex flex-col items-center gap-8">
        {/* Pillar Content */}
        <div className="w-full lg:w-3/4 text-center p-6 border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl shadow-md">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200">基石內容 (Pillar Content)</h3>
          </div>
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{blueprint.pillarContent}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">這是您建立專業權威的核心文章。</p>
        </div>

        {/* Separator */}
        <div className="w-1/2 h-px bg-gray-300 dark:bg-gray-600"></div>

        {/* Cluster Topics */}
        <div>
          <h4 className="text-lg font-bold text-center mb-4 text-gray-800 dark:text-gray-200">主題集群 (Cluster Topics)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blueprint.clusterTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => onSelectTopic(topic)}
                className="group flex items-center text-left gap-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Zap className="h-6 w-6 text-indigo-500 group-hover:text-indigo-600 flex-shrink-0 transition-colors" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{topic}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

       <div className="mt-12 text-center">
            <button 
                onClick={onReset} 
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
                <RefreshCw className="h-4 w-4" /> 重新規劃策略
            </button>
        </div>
    </div>
  );
};

export default ContentBlueprint;
