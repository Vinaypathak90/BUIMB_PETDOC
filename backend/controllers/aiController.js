const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with your API Key from .env
// Make sure require('dotenv').config() is called in your server.js
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeMedicalQuery = async (req, res) => {
    
    try {
        // 1. Extract data from frontend request
        const { prompt, imageBase64 } = req.body;

        if (!prompt && !imageBase64) {
            return res.status(400).json({ message: "Please provide symptoms or an image." });
        }

        // 2. Setup Gemini Model 
        // Note: 1.5-flash has better quota limits for Free Tier than 2.0-flash
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        // 3. Strict System Prompt for valid JSON
        const systemInstruction = `
            You are 'PetDoc AI', a professional medical and veterinary diagnostic assistant.
            Analyze the user symptoms or medical reports provided.
            
            RULES:
            - Return ONLY a valid JSON object.
            - NO markdown, NO backticks (like \`\`\`json), NO conversational filler.
            - If it's a pet, recommend a 'Veterinarian'.
            - If it's a human, recommend the specific specialist (e.g. 'Dermatologist').

            JSON STRUCTURE:
            {
                "disease": "Likely Condition Name",
                "confidence": "85%",
                "severity": "Low/Medium/High/Critical",
                "symptoms": ["list", "of", "symptoms"],
                "findings": "Professional 2-sentence summary.",
                "doctorType": "Specialist Type"
            }
        `;

        // 4. Prepare Data for Gemini
        const parts = [
            { text: systemInstruction },
            { text: `User Input: ${prompt || "Analyze the attached medical image/report."}` }
        ];

        // 5. Handle Image if uploaded
        if (imageBase64) {
            try {
                const mimeType = imageBase64.split(';')[0].split(':')[1];
                const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

                parts.push({
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                });
            } catch (err) {
                console.error("Image processing error:", err);
                return res.status(400).json({ message: "Invalid image format." });
            }
        }

        // 6. Generate Response from Gemini
        console.log("⏳ Sending request to Gemini AI...");
        
        const result = await model.generateContent(parts);
        const response = await result.response;
        const responseText = response.text();

        // 7. Clean and Parse the JSON Response
        // Regular expression to strip away any markdown or backticks AI might add
        const cleanJsonString = responseText
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
        
        try {
            const finalData = JSON.parse(cleanJsonString);
            console.log("✅ AI Analysis Complete:", finalData.disease);
            
            // 8. Send structured response to React Frontend
            res.status(200).json(finalData);
        } catch (parseError) {
            console.error("JSON Parsing Error. Raw Text:", responseText);
            res.status(500).json({ message: "AI returned invalid format. Try rephrasing." });
        }

    } catch (error) {
        console.error("❌ AI Controller Error:", error);

        // Specific handling for Quota/Rate Limit
        if (error.message.includes("429") || error.message.includes("quota")) {
            return res.status(429).json({ 
                message: "AI is busy (Quota Limit). Please wait 30 seconds and try again.",
                error: "Rate limit exceeded"
            });
        }

        // Specific handling for Invalid Key
        if (error.message.includes("400") || error.message.includes("key")) {
            return res.status(401).json({ 
                message: "API Key is invalid or expired. Please check your .env file.",
                error: "Authentication failed"
            });
        }

        res.status(500).json({ 
            message: "Internal Server Error in AI Analysis.", 
            error: error.message 
        });
    }
};

