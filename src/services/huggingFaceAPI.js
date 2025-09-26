import OpenAI from 'openai';

const API_KEY = process.env.REACT_APP_HUGGING_FACE_API_KEY || '';

// Debug environment variables
console.log('=== ENVIRONMENT DEBUG ===');
console.log('- process.env exists:', typeof process !== 'undefined' && typeof process.env !== 'undefined');
console.log('- API_KEY value:', API_KEY);
console.log('- API_KEY length:', API_KEY.length);
console.log('- API_KEY starts with hf_:', API_KEY.startsWith('hf_'));
console.log('- process.env.REACT_APP_HUGGING_FACE_API_KEY:', process.env.REACT_APP_HUGGING_FACE_API_KEY);
console.log('========================');

// Initialize OpenAI client for Hugging Face router
const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: 'https://router.huggingface.co/v1',
    dangerouslyAllowBrowser: true // Required for browser usage
});

// Helper function to make API requests using OpenAI client
const makeOpenAIRequest = async (model, messages, options = {}) => {
    console.log('Making OpenAI API request to model:', model);
    console.log('Messages:', messages);
    console.log('Options:', options);
    console.log('API Key present:', !!API_KEY);
    console.log('API Key starts with hf_:', API_KEY.startsWith('hf_'));

    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: messages,
            max_tokens: options.max_tokens || 1000,
            temperature: options.temperature || 0.7,
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

    console.log('Using Hugging Face API to validate topic:', topic);

    let isValid = false;
    let reason = 'Topic isn\'t suitable for trivia questions. Try again!';
    let suggestions = []

    // Use a classification model to determine if the topic is suitable for trivia
    const prompt = `Is "${topic}" a suitable topic for generating trivia questions? Consider:
- Is it factual?
- Is it unambiguous?
- Can meaningful questions be generated about it?
- Is it not too vague?

Respond in JSON format with "isValid: true" or "isValid: false", a short "reason" in a casual tone, and if the topic is not valid, provide three short suggestions or alternatives related to ${topic}. Keep suggestions brief, maximum six words.`;

    try {
        // Use OpenAI client for validation
        const response = await makeOpenAIRequest('moonshotai/Kimi-K2-Instruct-0905', [
            {
                role: 'user',
                content: prompt
            }
        ], {
            max_tokens: 100,
            temperature: 0.6
        });

        const generatedText = response.choices[0]?.message?.content || '';
        console.log('HF API validation response:', generatedText);

        const responseText = JSON.parse(generatedText);
        console.log('HF API validation response:', responseText);

        isValid = responseText.isValid,
            reason = responseText.reason
            suggestions = responseText.suggestions || []

    } catch (apiError) {
        console.warn('HF API validation failed:', apiError.message);
    }

    console.log('Validation result for topic:', topic, isValid, reason, suggestions);
    return {
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
    try {
        if (!API_KEY || API_KEY === 'your_hugging_face_api_key_here') {
            console.warn('Hugging Face API key not configured. Using sample questions.');
            return generateSampleQuestions(topic, numQuestions);
        }

        console.log('Using Hugging Face API to generate questions for topic:', topic);

        const prompt = `Generate ${numQuestions} trivia questions about "${topic}". Each question should have:
1. A clear, factual question
2. 4 multiple choice answers (A, B, C, D)
3. The correct answer marked with an asterisk (*)

Format each question like this:
Q1: [Question text]
A) [Answer 1]
B) [Answer 2] 
C) [Answer 3] *
D) [Answer 4]

Make sure questions are factual.`;

        // Try multiple models in sequence, falling back if one fails
        const modelsToTry = [
            'moonshotai/Kimi-K2-Instruct-0905',
            'microsoft/DialoGPT-small',
            'gpt2',
            'distilgpt2'
        ];

        for (const model of modelsToTry) {
            try {
                console.log(`Trying model: ${model}`);
                const response = await makeOpenAIRequest(model, [
                    {
                        role: 'user',
                        content: prompt
                    }
                ], {
                    max_tokens: 1000,
                    temperature: 0.7,
                    top_p: 0.9
                });

                const generatedText = response.choices[0]?.message?.content || '';
                console.log(`HF API generated text from ${model}:`, generatedText);

                // Parse the generated text into structured questions
                const parsedQuestions = parseTriviaQuestions(generatedText, numQuestions);

                if (parsedQuestions.length > 0) {
                    console.log(`Successfully generated ${parsedQuestions.length} questions from ${model}`);
                    return parsedQuestions;
                } else {
                    console.log(`Failed to parse questions from ${model}, trying next model`);
                }
            } catch (modelError) {
                console.warn(`Model ${model} failed:`, modelError.message);
                continue; // Try next model
            }
        }

        // If all models failed, use sample questions
        console.log('All HF models failed, using sample questions');
        return generateSampleQuestions(topic, numQuestions);

    } catch (error) {
        console.error('Error generating trivia questions with HF API:', error);
        console.log('Falling back to sample questions');
        return generateSampleQuestions(topic, numQuestions);
    }
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

/**
 * Generates sample questions as fallback
 * @param {string} topic - The topic
 * @param {number} count - Number of questions
 * @returns {Array} Sample questions
 */
const generateSampleQuestions = (topic, count) => {
    const sampleQuestions = [
        {
            id: 1,
            question: `What is a key characteristic of ${topic}?`,
            answers: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
            topic
        },
        {
            id: 2,
            question: `Which of the following is most associated with ${topic}?`,
            answers: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
            correctAnswer: 1,
            topic
        },
        {
            id: 3,
            question: `What is the primary focus of ${topic}?`,
            answers: ['Focus A', 'Focus B', 'Focus C', 'Focus D'],
            correctAnswer: 2,
            topic
        },
        {
            id: 4,
            question: `Which statement best describes ${topic}?`,
            answers: ['Description 1', 'Description 2', 'Description 3', 'Description 4'],
            correctAnswer: 0,
            topic
        },
        {
            id: 5,
            question: `What is the main purpose of ${topic}?`,
            answers: ['Purpose A', 'Purpose B', 'Purpose C', 'Purpose D'],
            correctAnswer: 1,
            topic
        }
    ];

    return sampleQuestions.slice(0, count);
};