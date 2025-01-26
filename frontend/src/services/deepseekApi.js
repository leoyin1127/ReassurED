import OpenAI from 'openai';
import { DEEPSEEK_API_KEY } from '@env';

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com', // DeepSeek LLM endpoint
    apiKey: DEEPSEEK_API_KEY
});

// Add logging utility
const logApiRequest = (type, data) => {
    const timestamp = new Date().toISOString();
    console.log('=== DeepSeek API Request Log ===');
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Request Type: ${type}`);
    console.log('Request Data:', data);

    // You might want to save this to a file or send to a logging service
    // For now, we'll just log to console
};

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

/**
 * Get personalized pathway guidance from DeepSeek LLM
 * based on hospital, symptoms, and triage level
 */
export async function getPathwayGuidance(hospitalData, patientData) {
    // Log the request
    logApiRequest('Pathway Guidance Request', {
        hospital: {
            name: hospitalData.name,
            id: hospitalData.id,
            // Add other relevant hospital data but exclude sensitive information
        },
        patient: {
            triageLevel: patientData.triageLevel,
            timestamp: patientData.currentTime,
            // Add other relevant patient data but exclude sensitive information
        }
    });

    const systemPrompt = `
        You are an empathetic and reassuring hospital guide, focused on reducing patient anxiety.
        Analyze the patient's condition and hospital data to provide a detailed, specific care pathway.
        Use a warm, reassuring tone while being precise about medical procedures sections.
        
        Include specific medical procedures based on the patient's symptoms and triage level, such as:
        - Specific tests (blood tests, urinalysis, x-rays, CT scans, etc.)
        - Vital sign measurements
        - Physical examinations
        - Specialist consultations
        - Medication administration
        - Treatment procedures
        
        Return valid JSON only with the following structure:
        {
            "currentStep": "string",
            "estimatedTotalDuration": "string",
            "pathway": [
                {
                    "step": "string", // Be specific about the procedure/test
                    "status": "pending" | "active" | "completed",
                    "location": "string", // Specific department
                    "instructions": "string", // Include preparation instructions if needed
                    "estimatedDuration": "string",
                    "estimatedStartTime": "string",
                    "whatToExpect": "string", // Detail the procedure process
                    "requirements": ["string"], // Include specific preparation requirements
                    "tips": ["string"] // Mix of practical and comfort tips
                }
            ]
        }
        
        Guidelines:
        - Name specific procedures based on symptoms
        - Include relevant medical departments and specialists
        - Explain medical procedures in simple terms
        - Provide specific preparation instructions when needed
        - Include typical duration for each procedure
        - Mention if results will be available immediately or need wait time
        - Address common concerns about specific procedures
        Return only JSON. No extra text.

        Example step types based on triage level (Just for reference, the treatment pathway will be different for each diseases/symptoms):
        LEVEL_I (Immediate):
        - Trauma bay assessment
        - Emergency CT scan
        - Urgent blood work
        - Critical care team evaluation
        
        LEVEL_II (Emergency):
        - Rapid assessment room
        - Priority blood tests
        - Urgent X-rays
        - ECG monitoring
        
        LEVEL_III (Urgent):
        - Blood pressure monitoring
        - Basic blood work
        - X-rays if needed
        - Specialist consultation
        
        LEVEL_IV (Less Urgent):
        - Vital signs check
        - Basic examination
        - Possible lab tests
        - Treatment room visit
        
        LEVEL_V (Non-Urgent):
        - Initial assessment
        - Basic examination
        - Minor treatment if needed
        - Discharge instructions
    `;

    const userPrompt = `
        Hospital data:
        ${JSON.stringify(hospitalData)}

        Patient data:
        ${JSON.stringify(patientData)}

        Based on the triage level and symptoms, provide a specific, detailed care pathway 
        including relevant medical procedures and tests.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 1000,
            response_format: { type: 'json_object' }
        });

        // Log the successful response (excluding sensitive data)
        console.log('=== DeepSeek API Response Log ===');
        console.log('Status: Success');
        console.log('Response Length:', response.choices[0].message.content.length);
        console.log('Generated Steps:', JSON.parse(response.choices[0].message.content).pathway.length);

        return JSON.parse(response.choices[0].message.content);
    } catch (err) {
        // Log the error
        console.error('=== DeepSeek API Error Log ===');
        console.error('Status: Failed');
        console.error('Error:', err.message);
        console.error('Error Code:', err.code);
        console.error('Timestamp:', new Date().toISOString());

        // Return fallback response
        return {
            currentStep: "Initial Assessment",
            estimatedTotalDuration: "45-60 minutes",
            pathway: [
                {
                    step: "Vital Signs Check",
                    status: "active",
                    location: "Triage Room 2",
                    instructions: "A nurse will check your blood pressure, temperature, and oxygen levels",
                    estimatedDuration: "5-10 minutes",
                    estimatedStartTime: "Now",
                    whatToExpect: "Quick, non-invasive measurements using standard medical equipment",
                    requirements: ["None"],
                    tips: ["Relax and breathe normally for accurate readings"]
                }
            ]
        };
    }
} 