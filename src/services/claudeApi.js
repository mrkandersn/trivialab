const makeAiRequest = async (prompt, retries = 3) => {  

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
    if (retries > 0) {
      console.warn(`Retrying... (${retries} attempts left)`);
      return makeAiRequest(prompt, retries - 1);
    }
    return null;
  }
};

/**
 * Validates if a topic is suitable for generating trivia questions
 * @param {string} topic - The topic to validate
 * @returns {Promise<{isValid: boolean, reason?: string}>}
 */
export const validateTopic = async (topic) => {

  let topicData = {}

  // Determine if the topic is suitable for trivia
  const prompt = `
    Determine if "${topic}" is a suitable topic for generating trivia questions.

    Consider:
    - Is it factual?
    - Is it unambiguous?
    - Can meaningful questions be generated about it?
    - Is it not too vague?

    Respond ONLY in valid JSON (no markdown or extra text) with the following fields:
    {
      "isValid": true or false,
      "reason": "Brief explanation in a casual tone (max 100 characters)",
      "topicTitle": "Corrected version of the topic (proper spelling, punctuation, and capitalization)",
      "suggestions": ["Alt 1", "Alt 2", "Alt 3"] // Only include if isValid is false
    }
  `;

  try {
    // Use OpenAI client for validation
    const response = await makeAiRequest(prompt);

    return response;
  } catch (apiError) {
    console.warn("API validation failed:", apiError.message);
  }

  return null;
};

/**
 * Generates trivia questions for a validated topic
 * @param {string} topic - The validated topic
 * @param {number} numQuestions - Number of questions to generate (default: 10)
 * @returns {Promise<Array>} Array of trivia questions
 */
export const generateTriviaQuestions = async (topic, numQuestions = 10) => {

  const prompt = `
    Generate exactly ${numQuestions} trivia questions about "${topic}".

    Each question must include:
    1. A clear, factual question.
    2. Four multiple-choice answers labeled A–D.
    3. A short, casual description that briefly explains or adds context to the correct answer.
    4. Avoid using specific years or dates as answers unless they are especially significant or well-known.

    All questions must be factual and unambiguous.

    Return the result as valid, minified JSON (no Markdown, code fences, or commentary), in this format:

    [
      {
        "id": 0,
        "question": "Question text here",
        "answers": ["Answer A", "Answer B", "Answer C", "Answer D"],
        "correctAnswer": 1,
        "description": "Brief casual explanation of the correct answer."
      },
      ...more questions
    ]
    `;

  try {
    const response = await makeAiRequest(prompt);
    return response;
  } catch (err) {
    console.warn(`Failed:`, err);
  }

  return null;
};
