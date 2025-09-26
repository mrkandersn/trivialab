import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { validateTopic, generateTriviaQuestions } from '../services/claudeApi';
import { getRandomTopicsString } from '../utils/topicUtils';

function TopicSelector({ onTopicSubmit }) {
    const [topic, setTopic] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [isValidTopic, setIsValidTopic] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsSubmitting(true);
        setIsValidating(true);
        setValidationMessage('');

        try {
            // First validate the topic
            const validation = await validateTopic(topic.trim());

            if (!validation.isValid) {
                setValidationMessage(`❌ ${validation.reason}`);
                setSuggestions(validation.suggestions)
                setIsSubmitting(false);
                setIsValidating(false);
                setTopic('')
                return;
            }

            // If valid, generate questions
            setValidationMessage(`✅ ${validation.reason}`);
            getQuestions(validation.topicTitle);


        } catch (error) {
            console.error('Error processing topic:', error);
            setValidationMessage('❌ Error processing topic. Please try again.');
            setIsSubmitting(false);
            setIsValidating(false);
        }
    };

    const getQuestions = async (topic) => {
        setTopic(topic)
        setIsSubmitting(true)
        setIsValidating(true)
        setIsValidTopic(true)
        
         // TEMP return hardcode data
        // const questions = questionData;
        const questions = await generateTriviaQuestions(topic.trim(), 10);

        if (questions.length === 0) {
            setValidationMessage('❌ Unable to generate questions for this topic. Please try a different one.');
            setIsSubmitting(false);
            setIsValidating(false);
            return;
        }

        // Success - submit with questions
        onTopicSubmit(topic.trim(), questions);
    }

    return (
        <div className="bg-white/95 backdrop-blur-xs p-8 rounded-3xl shadow-2xl border border-white/20 max-w-2xl animate-fade-in-up">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">
                    🧠 Trivia Challenge
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                    Choose your topic and test your knowledge!
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                        What topic would you like to be quizzed on?
                    </label>
                    <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={`e.g., ${getRandomTopicsString(5)}...`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-lg placeholder:text-xs"
                        disabled={isSubmitting}
                    />
                </div>

                {validationMessage &&
                    <>
                        <div className={`
                            p-3 rounded-lg text-sm font-medium animate-fade-in 
                            ${!isValidTopic
                                ? 'text-red-700'
                                : 'bg-green-100'
                            }`}>
                            {validationMessage}
                        </div>
                        { !isValidTopic &&
                            <>
                                <h4 className="text-sm">Try another topic, or one of these suggestions:</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                                    {suggestions.map((topic) => (
                                        <button
                                            key={topic}
                                            type="button"
                                            onClick={() => getQuestions(topic)}
                                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 rounded-lg transition-colors duration-200 border border-transparent hover:border-indigo-200"
                                            disabled={isSubmitting}
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            </>
                        }
                    </>
                }

                <button
                    type="submit"
                    disabled={!topic.trim() || isSubmitting}
                    className="w-full bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            {isValidTopic ? 'Generating Questions...' : 'Validating Topic...'}
                        </div>
                    ) : (
                        'Start Trivia Quiz'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    💡 Tip: You can type any topic or click on popular topics above
                </p>
            </div>
        </div>
    );
}

TopicSelector.propTypes = {
    onTopicSubmit: PropTypes.func.isRequired,
};

export default TopicSelector;
