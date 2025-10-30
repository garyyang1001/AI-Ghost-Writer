import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface TopicInputProps {
  onStart: (topic: string) => void;
  error: string | null;
}

const TopicInput: React.FC<TopicInputProps> = ({ onStart, error }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onStart(topic.trim());
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg animate-fade-in-up">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">開始您的傑作</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          今天想探索什麼精彩主題？請告訴我核心主題，我將開始進行研究。
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="relative">
          <input
            id="topic"
            name="topic"
            type="text"
            required
            className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            placeholder="例如：再生能源的未來"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            aria-label="Topic Input"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 transition-colors"
            disabled={!topic.trim()}
          >
            開始研究與訪談
          </button>
        </div>
      </form>
    </div>
  );
};

export default TopicInput;