const makeAiRequest = async (prompt) => {
  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();

    return JSON.parse(data.text);
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return error;
  }
};

/**
 * Validates if a topic is suitable for generating trivia questions
 * @param {string} topic - The topic to validate
 * @returns {Promise<{isValid: boolean, reason?: string}>}
 */
export const validateTopic = async (topic) => {

  let isValid = false;
  let reason = "Something bad happened.";
  let suggestions = [];
  let topicTitle = null;

  // Determine if the topic is suitable for trivia
  const prompt = `
    Is "${topic}" a suitable topic for generating trivia questions? 
    
    Consider:
      - Is it factual?
      - Is it unambiguous?
      - Can meaningful questions be generated about it?
      - Is it not too vague?

      Respond in valid JSON format (without any surrounding text or markdown formatting) with:
      1. "isValid: true" or "isValid: false"
      2. a short "reason" providing context for the answer in a casual tone, and no more than 100 characters
      3. a "topicTitle" that is corrected title in terms of spelling, punctuation and format
      4. if the topic is not valid, provide three short suggestions or alternatives related to "${topic}". Keep suggestions brief, maximum six words.
    `;

  try {
    // Use OpenAI client for validation
    const response = await makeAiRequest(prompt);

    topicTitle = response.topicTitle;
    isValid = response.isValid;
    reason = response.reason;
    suggestions = response.suggestions || [];
  } catch (apiError) {
    console.warn("API validation failed:", apiError.message);
  }

  return {
    topicTitle,
    isValid,
    reason,
    suggestions,
  };
};

/**
 * Generates trivia questions for a validated topic
 * @param {string} topic - The validated topic
 * @param {number} numQuestions - Number of questions to generate (default: 10)
 * @returns {Promise<Array>} Array of trivia questions
 */
export const generateTriviaQuestions = async (topic, numQuestions = 10) => {

  const prompt = `
        Generate ${numQuestions} trivia questions about "${topic}". Each question should have:
                1. A clear, factual question
                2. 4 multiple choice answers (A, B, C, D)
                3. A brief description in a casual tone that provides additional clarification or explanation of the correct answer

        Make sure questions are factual.

        Return results with valid JSON syntax without Markdown prefix, using this format:
        [
            {
                "id": A unique ID (0, 1, 2...),
                "question": The text of the question
                "answers": [
                    0: Answer 0,
                    1: Answer 1,
                    2: Answer 2,
                    ...
                ],
                "correctAnswer": Number of correct answer,
                "description": Description text
            },
            ...additional questions
        ]
    `;

  try {
    const response = await makeAiRequest(prompt);
    return response;
  } catch (err) {
    console.warn(`Failed:`, err);
  }

  return;
};
