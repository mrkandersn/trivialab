import Anthropic from "@anthropic-ai/sdk";

const API_KEY = process.env.CLAUDE_API_KEY || '';

const anthropic = new Anthropic({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true
});


// Helper function to make API requests using OpenAI client
const makeAiRequest = async (messages, options = {}) => {
    try {

        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: options.max_tokens || 1000,
            temperature: options.temperature || 0.7,
            messages,
            ...options
        });

        console.log('OpenAI API Response:', response);
        return response;
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
    }
};

/**
 * Validates if a topic is suitable for generating trivia questions
 * @param {string} topic - The topic to validate
 * @returns {Promise<{isValid: boolean, reason?: string}>}
 */
export const validateTopic = async (topic) => {

    console.log('Using Claude API to validate topic:', topic);

    let isValid = false;
    let reason = 'Topic isn\'t suitable for trivia questions. Try again!';
    let suggestions = []
    let topicTitle = null

    // Determine if the topic is suitable for trivia
    const prompt = `Is "${topic}" a suitable topic for generating trivia questions? Consider:
        - Is it factual?
        - Is it unambiguous?
        - Can meaningful questions be generated about it?
        - Is it not too vague?

        Respond in valid JSON format (without any surrounding text or markdown formatting) with:
        1. "isValid: true" or "isValid: false"
        2. a short "reason" in a casual tone and no more than 100 characters
        3. a "topicTitle" that is corrected title in terms of spelling, punctuation and format
        4. if the topic is not valid, provide three short suggestions or alternatives related to "${topic}". Keep suggestions brief, maximum six words.
    `;

    try {
        // Use OpenAI client for validation
        const response = await makeAiRequest([
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ]);

        console.log('response', response)

        const generatedText = response.content[0]?.text || ''
        console.log('HF API validation response:', generatedText)

        const responseText = JSON.parse(generatedText);
        console.log('HF API validation response:', responseText);

        topicTitle = responseText.topicTitle
        isValid = responseText.isValid
        reason = responseText.reason
        suggestions = responseText.suggestions || []

    } catch (apiError) {
        console.warn('HF API validation failed:', apiError.message);
    }

    console.log('Validation result for topic:', topic, isValid, reason, suggestions);
    return {
        topicTitle,
        isValid,
        reason,
        suggestions
    };
};

/**
 * Generates trivia questions for a validated topic
 * @param {string} topic - The validated topic
 * @param {number} numQuestions - Number of questions to generate (default: 10)
 * @returns {Promise<Array>} Array of trivia questions
 */
export const generateTriviaQuestions = async (topic, numQuestions = 10) => {

    console.log('Using Claude API to generate questions for topic:', topic);

    const prompt = `
        Generate ${numQuestions} trivia questions about "${topic}". Each question should have:
                1. A clear, factual question
                2. 4 multiple choice answers (A, B, C, D)
                3. A brief description in a casual tone that provides additional clarification or explanation of the correct answer

        Make sure questions are factual.

        Return results with valid JSON syntax without Markdown prefix, using this format:
        {
            "data": [
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
        }
    `;


    try {
        const response = await makeAiRequest([
            {
                role: 'user',
                content: prompt
            }
        ], {
            max_tokens: 10000,
            temperature: 0.7,
            top_p: 0.9
        });

        const generatedText = response.content[0]?.text || ''
        console.log(`HF API generated text:`, generatedText);

        // Parse the generated text into structured questions
        // const parsedQuestions = parseTriviaQuestions(generatedText, numQuestions);

        let parsedQuestions = []

        try {
            parsedQuestions = JSON.parse(generatedText);
            console.log('parsedQuestions1', parsedQuestions)

        } catch (e) {
            console.warn('Error parsing questions', e)
        }
        


        console.log('parsedQuestions', parsedQuestions.data)

        if (parsedQuestions.data.length > 0) {
            console.log(`Successfully generated ${parsedQuestions.data.length} questions`);
            return parsedQuestions.data;
        }
    } catch (err) {
        console.warn(`Failed:`, err);
    }

    return;
};

/**
 * Parses generated text into structured trivia questions
 * @param {string} text - Generated text from API
 * @param {number} expectedCount - Expected number of questions
 * @returns {Array} Parsed questions array
 */
const parseTriviaQuestions = (text, expectedCount) => {
    const questions = [];
    const questionBlocks = text.split(/Q\d+:/).filter(block => block.trim());

    questionBlocks.slice(0, expectedCount).forEach((block, index) => {
        const lines = block.trim().split('\n').filter(line => line.trim());
        if (lines.length >= 5) {
            const question = lines[0].trim();
            const answers = lines.slice(1, 5).map(line => {
                const cleanLine = line.replace(/^[A-D]\)\s*/, '').replace(/\s*\*$/, '');
                return cleanLine.trim();
            });

            // Find correct answer (marked with *)
            let correctIndex = 0;
            lines.slice(1, 5).forEach((line, idx) => {
                if (line.includes('*')) {
                    correctIndex = idx;
                }
            });

            questions.push({
                id: index + 1,
                question,
                answers,
                correctAnswer: correctIndex,
                topic: 'Generated'
            });
        }
    });

    return questions;
};