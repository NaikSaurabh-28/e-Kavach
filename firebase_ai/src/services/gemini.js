import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini API client
// Note: Ensure you have the GOOGLE_GENAI_API_KEY environment variable set or pass the apiKey below.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generates an explanation for malware scan results using Gemini API.
 * 
 * @param {object} scanDetails - The details of the malware scan
 * @param {string} scanDetails.fileName - Name of the file scanned
 * @param {string} scanDetails.threatType - Type of threat detected (e.g., 'Ransomware', 'Trojan', 'Phishing')
 * @param {string[]} scanDetails.indicators - List of Indicators of Compromise (IoCs)
 * @param {string} scanDetails.riskLevel - Risk level (e.g., 'high', 'critical')
 * @returns {Promise<string>} - Human-readable explanation and recommendations
 */
export async function generateMalwareExplanation(scanDetails) {
  try {
    const prompt = `
You are a cybersecurity assistant for Indian court clerks.
Explain the following malware finding in simple English. Keep it non-technical.

Threat Details:
- File Name: ${scanDetails.fileName}
- Threat Type: ${scanDetails.threatType}
- Risk Level: ${scanDetails.riskLevel}
- Indicators of Compromise: ${scanDetails.indicators ? scanDetails.indicators.join(', ') : 'None specified'}

Please provide the explanation mentioning exactly these points:
- What was found
- Where it was found
- Why dangerous
- Possible impact
- Recommended action
`;

    // Using gemini-2.5-pro as it's the recommended model for complex reasoning tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        temperature: 0.2, // Low temperature for more factual/analytical response
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating malware explanation with Gemini: ", error);
    throw new Error("Failed to generate threat explanation");
  }
}
