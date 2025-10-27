import React, { useState } from 'react';
import { validateTopic, generateTriviaQuestions } from 'src/services/claudeApi';
import { getRandomTopicsString } from 'src/utils/topicUtils';
import type { Question } from 'src/types/question';

type TopicSelectorProps = {
  onTopicSubmit: (topic: string, questions: Question[]) => void;
}

function TopicSelector({ onTopicSubmit }: TopicSelectorProps) {
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValidTopic, setIsValidTopic] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [placeholderText] = useState(() => getRandomTopicsString(5));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsSubmitting(true);
    setValidationMessage('');

    try {
      // First validate the topic
      const validation = await validateTopic(topic.trim());
      if (validation === null) {
        return;
      }

      setIsValidTopic(validation.isValid);
      setValidationMessage(validation.reason);

      if (!validation.isValid) {
        setSuggestions(validation.suggestions);
        setIsSubmitting(false);
        setTopic('');
        return;
      }

      // If valid, generate questions
      getQuestions(validation.topicTitle);
    } catch (error) {
      console.error('Error processing topic:', error);
      setValidationMessage('Oops. Error processing topic. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getQuestions = async (topic: string) => {
    setTopic(topic);
    setIsValidTopic(true);
    setIsSubmitting(true);

    const questions = await generateTriviaQuestions(topic.trim(), 10);

    if (questions === null) {
      setIsValidTopic(false);
      setValidationMessage(
        'Oops! Something bad happened. Please try again.'
      );
      setIsSubmitting(false);
      return;
    }

    // Success - submit with questions
    onTopicSubmit(topic.trim(), questions);
  };

  const handleSuggestedTopic = (suggestedTopic: string) => {
    // Clear invalid message
    setValidationMessage('');
    // Immediately get questions for this topic
    getQuestions(suggestedTopic);
  };

  return (
    <div className="bg-white/95 backdrop-blur-xs p-8 rounded-3xl shadow-2xl border border-white/20 max-w-2xl animate-fade-in-up">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          🧠 The TriviaLab 🧠
        </h1>
        <p className="text-gray-600 text-sm md:text-lg">
          Pick a topic and test your knowledge.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            What topic will you tackle?
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={`e.g., ${placeholderText}...`}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-lg placeholder:text-xs truncate"
            disabled={isSubmitting}
          />
        </div>

        {validationMessage && (
          <>
            <div
              className={`
                            relative p-3 rounded-lg text-sm font-medium animate-fade-in 
                            ${
                              !isValidTopic
                                ? 'text-red-700 border border-red-200'
                                : 'text-green-700 border border-green-500'
                            }`}
            >
              {validationMessage}
              {!isValidTopic ? (
                <div className="absolute -right-2 -top-2">❌</div>
              ) : (
                <div className="absolute -right-2 -top-2">✅</div>
              )}
            </div>
            {!isValidTopic && suggestions.length > 0 && (
              <>
                <h4 className="text-sm">
                  Enter another topic, or try one of these suggestions:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                  {suggestions.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handleSuggestedTopic(topic)}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 rounded-lg transition-colors duration-200 border border-transparent hover:border-indigo-200 cursor-pointer"
                      disabled={isSubmitting}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={!topic.trim() || isSubmitting}
          className="w-full border-2 border-solid  bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center animate-text-color">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isValidTopic ? 'Generating Questions...' : 'Validating Topic...'}
            </div>
          ) : (
            'Start Trivia Quiz'
          )}
        </button>
      </form>

      {/*
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    💡 Tip: You can type any topic or click on popular topics above
                </p>
            </div>
            */}
    </div>
  );
}

export default TopicSelector;
