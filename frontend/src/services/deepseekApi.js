import OpenAI from 'openai';
import { DEEPSEEK_API_KEY } from '@env';

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com', // DeepSeek LLM endpoint
    apiKey: DEEPSEEK_API_KEY
});

/**
 * Call the DeepSeek LLM to determine the triage level I–V.
 * Expects patient's assessment data and returns a JSON object
 * with a "triageLevel" field among other data.
 */
export async function getTriageFromDeepSeek(assessmentData) {
    const systemPrompt = `
        You are a medical triage assistant. 
        The user will provide medical symptom data (where fields can be missing). 
        Please return valid JSON only. 
        The JSON must have the shape:
        {
            "triageLevel": "LEVEL_I" | "LEVEL_II" | "LEVEL_III" | "LEVEL_IV" | "LEVEL_V",
            "reasoning": "Short explanation of why"
        }

        The triageLevel must be one of LEVEL_I, LEVEL_II, LEVEL_III, LEVEL_IV, or LEVEL_V.
        Return only JSON. No extra text.
    `;

    const userPrompt = `
        Patient data (JSON format):

        ${JSON.stringify(assessmentData)}

        Please analyze the patient's condition and respond with JSON only.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 300,
            response_format: {
                type: 'json_object'
            }
        });

        // Safely parse the resulting JSON
        return JSON.parse(response.choices[0].message.content);
    } catch (err) {
        console.error('Error fetching triage from DeepSeek:', err);
        // Fallback structure if LLM call fails
        return {
            triageLevel: 'LEVEL_V',
            reasoning: 'LLM call failed, defaulting to LEVEL_V'
        };
    }
} 