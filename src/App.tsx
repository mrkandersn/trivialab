import React, { useState } from 'react';
import TopicSelector from './components/TopicSelector';
import Questions from './components/Questions';
import './index.css';
import type { Question } from './types/question';

function App() {
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleTopicSubmit = (topic: string, questions: Question[]) => {
    setSelectedTopic(topic);
    setQuestions(questions)
  };

  return (
    <div className="min-h-screen flex justify-center bg-linear-to-br from-indigo-500 to-purple-600 font-sans antialiased p-4">
      <div className="w-full max-w-2xl">
        {!selectedTopic ? (
            <>
                <TopicSelector onTopicSubmit={handleTopicSubmit} />
            </>
        ) : (
          <div className="bg-white/95 backdrop-blur-xs p-8 rounded-3xl shadow-2xl border border-white/20">
            <Questions topic={selectedTopic} questions={questions} setSelectedTopic={setSelectedTopic} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
