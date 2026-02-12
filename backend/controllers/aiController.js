const { GoogleGenerativeAI } = require("@google/generative-ai");

// Check for API Key
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ FATAL ERROR: GEMINI_API_KEY is missing in .env file");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeHealth = async (req, res) => {
    try {
        const { prompt, imageBase64 } = req.body;

        console.log("🔹 Gemini Request Received");

        // Use 'gemini-1.5-flash' (Best for real-time chat & images)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let result;
        
        // 1. Handle Image Analysis (X-Rays, Reports)
        if (imageBase64) {
            console.log("🔹 Processing Image...");
            const imageParts = [
                {
                    inlineData: {
                        data: imageBase64.split(",")[1] || imageBase64, 
                        mimeType: "image/png",
                    },
                },
            ];
            
            const fullPrompt = `You are an expert medical AI. Analyze this medical image/report. 
            Return strictly valid JSON (NO Markdown) with this structure:
            {
                "disease": "Diagnosis Name",
                "confidence": "High/Medium/Low",
                "severity": "Low/Medium/High",
                "findings": "Key observations in 2 sentences",
                "doctorType": "Specialist Name",
                "symptoms": ["Symptom1", "Symptom2"]
            }`;
            
            result = await model.generateContent([fullPrompt, ...imageParts]);
        } 
        // 2. Handle Text Symptoms
        else {
            console.log("🔹 Processing Text...");
            const chatPrompt = `
            Act as PetDoc AI. Analyze this symptom: "${prompt}".
            Return strictly valid JSON (NO Markdown, NO \`\`\`json tags) with this structure:
            {
                "disease": "Potential Condition",
                "confidence": "High/Medium/Low",
                "severity": "Low/Medium/High",
                "findings": "Brief medical explanation",
                "doctorType": "Recommended Specialist",
                "symptoms": ["Symptom1", "Symptom2"]
            }`;
            result = await model.generateContent(chatPrompt);
        }

        const response = await result.response;
        const text = response.text();
        
        // Clean up Markdown formatting if Gemini adds it
        const cleanText = text.replace(/```json|```/g, "").trim();
        
        try {
            const jsonData = JSON.parse(cleanText);
            res.json(jsonData);
        } catch (parseError) {
            console.error("❌ JSON Parse Error:", parseError);
            // Fallback response if AI returns raw text
            res.json({
                disease: "General Advice",
                findings: text, 
                severity: "Low",
                symptoms: [],
                doctorType: "General Physician"
            });
        }

    } catch (error) {
        console.error("❌ GEMINI ERROR:", error.message);
        res.status(500).json({ message: "AI Error", details: error.message });
    }
};