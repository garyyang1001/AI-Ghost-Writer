import React, { useState } from 'react';
import { Target, Info } from 'lucide-react';

interface GoalInputProps {
  onStart: (goal: string) => void;
  error: string | null;
}

const GoalInput: React.FC<GoalInputProps> = ({ onStart, error }) => {
  const [goal, setGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onStart(goal.trim());
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg animate-fade-in-up max-w-3xl mx-auto">
      <div className="text-center">
        <Target className="h-12 w-12 mx-auto text-indigo-500" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">設定您的核心目標</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          告訴我您想成為哪個領域的專家，我將為您規劃內容藍圖。
        </p>
      </div>
      
      {/* --- New Guidance Section --- */}
      <div className="mt-8 p-4 bg-indigo-50 dark:bg-gray-900/50 rounded-lg border border-indigo-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-indigo-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">如何寫出一個好目標？</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              一個清晰、具體的目標能幫助 AI 為您打造最精準的內容策略。您可以參考以下架構來描述您的願景：
            </p>
            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-md text-sm space-y-2">
              <p><strong className="text-indigo-600 dark:text-indigo-400">[您的角色/榜樣]：</strong>我想成為像是 The Futur, Chris Do 那樣的人...</p>
              <p><strong className="text-indigo-600 dark:text-indigo-400">[您的目標受眾]：</strong>...帶領想要逃離上班族生活的人...</p>
              <p><strong className="text-indigo-600 dark:text-indigo-400">[您提供的價值]：</strong>...從經營自有品牌、製造內容開始...</p>
              <p><strong className="text-indigo-600 dark:text-indigo-400">[最終的轉變]：</strong>...一步步從打造副業邁向自由接案的人生。</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="relative">
          <textarea
            id="goal"
            name="goal"
            rows={5}
            required
            className="w-full pl-4 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-lg resize-none"
            placeholder="請參考上方的架構，在此詳細描述您的目標..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            aria-label="Core Goal Input"
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 transition-colors"
            disabled={!goal.trim()}
          >
            生成內容藍圖
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalInput;