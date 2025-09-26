import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getResultText } from '../utils/wordUtils';

const Questions = ({ topic, questions, setSelectedTopic }) => {

    const [currentId, setCurrentId] = useState(0);
    const [answerId, setAnswerId] = useState(null);
    const [score, setScore] = useState(0);

    const checkAnswer = (id) => {
        setAnswerId(id);
        if (id === currentQuestion().correctAnswer) {
            setScore(prev => prev + 1)
        }
    }

    const goToNextQuestion = () => {
        // Reset answer, go to next
        setAnswerId(null)
        // TODO check for end
        setCurrentId((prev) => {
            return prev + 1
        })
    }

    const currentQuestion = () => questions[currentId] || {}

    const getStatusClass = (index) => {
        if (index === answerId) {
            // Set state for clicked button
            return isCorrectAnswer() ? 'border-green-500  animate-zoom' : 'border-red-500 animate-shake'
        } else if (isAnswered() && index === currentQuestion().correctAnswer) {
            // Set state for correct answer, if answer is incorrect
            return 'border-green-500';
        }

        return null
    }

    const isCorrectAnswer = () => {
        return isAnswered() && answerId === currentQuestion().correctAnswer
    }

    const showAnswerResult = () => {
        if (!isAnswered()) {
            return false;
        }
        return getResultText(isCorrectAnswer())
    }

    const showAnswerEmoji = (index) => {
        if (!isAnswered()) {
            return false;
        }
        const classes = "absolute -right-2 -top-2"
        if (index === currentQuestion().correctAnswer) {
            return <div className={classes}>✅</div>
        } else if (index === answerId) {
            return <div className={classes}>❌</div>
        }

        return false;
    }

    const isAnswered = () =>  answerId !== null

    return (
        <div>
            {currentId < questions.length
                ?
                <>
                    <h1>Questions for {topic}</h1>
                    <h2 className="py-8 text-lg font-bold">#{currentId + 1}: {currentQuestion().question}</h2>
                    <div className='flex justify-between flex-wrap gap-4'>
                        {currentQuestion().answers?.map((answer, index) => (
                            <button
                                value={index}
                                key={index}
                                onClick={() => checkAnswer(index)}
                                className={`
                                relative grow-1 basis-auto px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg transition-colors duration-200 border 
                                ${!isAnswered() ? 'hover:text-indigo-700 hover:bg-indigo-100 hover:border-indigo-200' : ''}
                                ${getStatusClass(index)}
                            `}
                                disabled={isAnswered()}
                            >
                                {answer}
                                { showAnswerEmoji(index) }
                            </button>)
                        )}
                    </div>
                </>
                :
                <>
                    <div>Done! { `${score}/${questions.length}` } correct</div>
                    <button
                        onClick={() => setSelectedTopic(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Choose Different Topic
                    </button>
                </>
            }

            { showAnswerResult() &&
                <div className="py-4 text-sm">
                    <span className={`
                        font-bold 
                        ${isCorrectAnswer() ? 'text-green-600' : 'text-red-600'}
                    `}>
                        { showAnswerResult() }
                    </span> { currentQuestion().description }
                </div>
            }

            { isAnswered() && (
                <button 
                    className="py-2 px-3 rounded font-medium select-none border text-gray-900 dark:text-white bg-white dark:bg-gray-800 transition-colors hover:border-blue-600 hover:bg-blue-400 hover:text-white dark:hover:text-white mx-auto block" 
                    onClick={goToNextQuestion}
                >
                    Next Question &rarr;
                </button>
            )}
        </div>
    );
};
Questions.propTypes = {
    topic: PropTypes.string.isRequired,
    questions: PropTypes.array.isRequired,
    setSelectedTopic: PropTypes.func.isRequired,
};

export default Questions;