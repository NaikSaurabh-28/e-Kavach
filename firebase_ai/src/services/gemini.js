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
You are a cybersecurity expert analyzing a potential malware threat for a government document portal.
Please provide a clear, concise, and professional explanation of the following threat.
Include the potential impact and recommended mitigation steps.

Threat Details:
- File Name: ${scanDetails.fileName}
- Threat Type: ${scanDetails.threatType}
- Risk Level: ${scanDetails.riskLevel}
- Indicators of Compromise: ${scanDetails.indicators ? scanDetails.indicators.join(', ') : 'None specified'}

Output Format:
1. Executive Summary
2. Technical Explanation
3. Potential Impact
4. Recommended Actions
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
