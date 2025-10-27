import React, { useState } from "react";
import PropTypes from "prop-types";
import { getResultText, getScorePhrase } from "src/utils/wordUtils";
import { Question } from "src/types/question";

type QuestionsProps = {
  topic: string;
  questions: Question[];
  setSelectedTopic: (topic: string | undefined) => void;
}

const Questions = ({ topic, questions, setSelectedTopic }: QuestionsProps) => {
  const [currentId, setCurrentId] = useState<number>(0);
  const [answerId, setAnswerId] = useState<number | undefined>(undefined);
  const [score, setScore] = useState<number>(0);

  const checkAnswer = (id: number) => {
    setAnswerId(id);
    if (id === currentQuestion().correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const goToNextQuestion = () => {
    // Reset answer, go to next
    setAnswerId(undefined);
    // TODO check for end
    setCurrentId((prev) => {
      return prev + 1;
    });
  };

  const currentQuestion = () => questions[currentId] || {};

  const getStatusClass = (index: number) => {
    if (index === answerId) {
      // Set state for clicked button
      return isCorrectAnswer()
        ? "border-green-500  animate-zoom"
        : "border-red-500 animate-shake";
    } else if (isAnswered() && index === currentQuestion().correctAnswer) {
      // Set state for correct answer, if answer is incorrect
      return "border-green-500";
    }

    return null;
  };

  const isCorrectAnswer = () => {
    return isAnswered() && answerId === currentQuestion().correctAnswer;
  };

  const showAnswerResult = () => {
    if (!isAnswered()) {
      return false;
    }
    return getResultText(isCorrectAnswer());
  };

  const showAnswerEmoji = (index: number) => {
    if (!isAnswered()) {
      return false;
    }
    const classes = "absolute -right-2 -top-2";
    if (index === currentQuestion().correctAnswer) {
      return <div className={classes}>✅</div>;
    } else if (index === answerId) {
      return <div className={classes}>❌</div>;
    }

    return false;
  };

  const isAnswered = () => answerId !== null;

  return (
    <>
      <header className="flex gap-x-4 items-end justify-between text-lg text-purple-800 font-medium border-b border-b-purple-800">
        <h1>TriviaLab: {topic}</h1>
        { currentId < questions.length &&
            <div className="text-nowrap">
                {currentId + 1} of {questions.length}
            </div>
        }
      </header>
      <div key={currentId} className="transition-all duration-500">
        {currentId < questions.length ? (
          <>
            <h2 className="py-8 text-2xl font-bold">
              #{currentId + 1}: {currentQuestion().question}
            </h2>
            <div className="flex justify-between flex-wrap gap-4">
              {currentQuestion().answers?.map((answer, index) => (
                <button
                  value={index}
                  key={index}
                  onClick={() => checkAnswer(index)}
                  className={`
                                relative grow-1 basis-auto px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg transition-colors duration-200 border border-gray-500 
                                ${
                                  !isAnswered()
                                    ? "hover:text-indigo-800 hover:bg-indigo-100 hover:border-indigo-500 cursor-pointer"
                                    : ""
                                }
                                ${getStatusClass(index)}
                            `}
                  disabled={isAnswered()}
                >
                  {answer}
                  {showAnswerEmoji(index)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="py-8 text-2xl font-bold">
                <p className="mb-2">Done! You got {`${score} out of ${questions.length}`} correct.</p>
                <p>{getScorePhrase(score)}</p>
            </div>
            <button
              onClick={() => setSelectedTopic(undefined)}
              className="py-2 px-3 rounded-lg font-medium select-none border text-gray-900 bg-white transition-colors hover:border-blue-600 hover:bg-blue-400 hover:text-white mx-auto block cursor-pointer"
            >
              Try again with new topic
            </button>
          </>
        )}

        {showAnswerResult() && (
          <aside className="py-4 text-sm rounded-lg border border-purple-200 p-4 md:p-6 my-6">
            <span
              className={`
                        font-bold 
                        ${isCorrectAnswer() ? "text-green-600" : "text-red-600"}
                    `}
            >
              {showAnswerResult()}
            </span>{" "}
            {currentQuestion().description}
          </aside>
        )}

        {isAnswered() && (
          <button
            className="py-2 px-3 rounded-lg font-medium select-none border text-gray-900 bg-white transition-colors hover:border-blue-600 hover:bg-blue-400 hover:text-white mx-auto block cursor-pointer"
            onClick={goToNextQuestion}
          >
            {currentQuestion().id + 1 < questions.length
              ? "Next Question"
              : "See Results"}
            {" \u2192"}
          </button>
        )}
      </div>
    </>
  );
};
Questions.propTypes = {
  topic: PropTypes.string.isRequired,
  questions: PropTypes.array.isRequired,
  setSelectedTopic: PropTypes.func.isRequired,
};

export default Questions;
