import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the Gemini AI client
let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

export const analyzeProductQuery = async (query: string, productCatalog: Product[]): Promise<string> => {
    if (!ai) {
        return "AI Assistant is unavailable (Missing API Key).";
    }

    try {
        // Create a lightweight context of the catalog for the AI
        const catalogContext = productCatalog.map(p => 
            `- ${p.brandName} ${p.composition ? `(${p.composition})` : ''}: ${p.division || 'General'}, Stock: ${p.stockStatus}, Tags: ${p.tags?.join(', ')}`
        ).join('\n');

        const prompt = `
        You are a smart pharma assistant for a B2B ordering portal.
        
        User Query: "${query}"

        Here is the available Product Catalog:
        ${catalogContext}

        Task:
        1. Identify which products from the catalog match the user's need (symptoms, generic name, brand, or medical context).
        2. Provide a brief, professional recommendation list based strictly on the catalog above.
        3. If no product matches, politely say so.
        4. Keep the response short (under 50 words) and sales-oriented.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview',
            contents: prompt,
        });

        return response.text || "I couldn't generate a response.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Sorry, I encountered an error processing your request.";
    }
};

export const generateMarketingCaption = async (product: Product): Promise<string> => {
    if (!ai) return "AI Service Unavailable";

    try {
        const compText = product.composition ? `composed of "${product.composition}"` : "";
        const prompt = `Write a short, professional, and catchy sales message (max 40 words) for a pharmaceutical distributor to share on WhatsApp about the product: "${product.brandName}" ${compText}. Mention it is available at Janus Biotech. Add appropriate emojis.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview',
            contents: prompt,
        });
        return response.text || "";
    } catch (e) {
        console.error(e);
        return "Error generating caption.";
    }
}

export const askAdminAssistant = async (query: string, contextData: string): Promise<string> => {
    if (!ai) return "AI is not configured.";
    
    try {
        const prompt = `
        You are an intelligent Admin Assistant for a Pharma Company. 
        Current Data Context: ${contextData}
        
        Admin Query: ${query}
        
        Provide a professional, analytical, or creative response to help the admin.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview',
            contents: prompt,
        });
        return response.text || "No response generated.";
    } catch (e) {
        return "Error connecting to AI.";
    }
}

export const generateProductTags = async (brandName: string, composition?: string): Promise<string[]> => {
    if (!ai) return [];
    try {
        const prompt = `
        Generate 5-7 relevant search tags for the item: "${brandName}" ${composition ? `which contains "${composition}"` : ''}.
        Include: Common symptoms it treats (if medicine), Category (e.g. Antibiotic, Gift, Bag), and alternative common names.
        Return ONLY a comma-separated list of keywords. No explanations.
        Example Output: Acidity, Gastritis, Stomach Pain, PPI, Pantoprazole
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview',
            contents: prompt,
        });
        
        const text = response.text || "";
        return text.split(',').map(tag => tag.trim()).filter(t => t.length > 0);
    } catch (e) {
        console.error("Tag Generation Error", e);
        return [];
    }
}

export const identifyProductFromImage = async (base64Image: string, productCatalog: Product[]): Promise<string> => {
    if (!ai) return "";

    try {
         // Create a context of valid product names to help the AI match
         const productNames = productCatalog.map(p => `${p.brandName} ${p.composition ? `(${p.composition})` : ''}`).join(', ');

         const prompt = `
         Analyze this image of a medicine or product. 
         1. Read the brand name or text from the package.
         2. Check if it matches or is very similar to any product in this list: [${productNames}].
         3. If a match is found, return ONLY the Brand Name from the list.
         4. If no exact match is found, return the most prominent text (Brand or Composition) found on the image.
         `;

         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
                    { text: prompt }
                ]
            }
        });

        return response.text?.trim() || "";
    } catch (e) {
        console.error("Visual Search Error", e);
        return "";
    }
}