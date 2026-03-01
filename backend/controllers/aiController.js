const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatHistory = require('../models/ChatHistory'); 
const mammoth = require('mammoth');

// Initialize Gemini with your API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 1. MAIN AI ANALYSIS CONTROLLER
 * Supports: Text, Images, PDFs, Word (.docx), Multilingual, and Chat Memory
 */
exports.analyzeMedicalQuery = async (req, res) => {
    try {
        // 🚨 SMART USER ID EXTRACTOR (Solves the 401 Unauthorized Issue)
        const userId = req.userId || (req.user && req.user._id) || (req.user && req.user.id) || req.user;

        // Extract prompt and other data
        const { prompt, imageBase64, language, chatId } = req.body;

        if (!prompt && !imageBase64) {
            return res.status(400).json({ message: "Please provide input or a document." });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const targetLanguage = language === 'hi' ? 'Hindi' : 'English';

        // STRICT SYSTEM PROMPT
        const systemInstruction = `
            You are 'PetDoc AI', a professional medical and veterinary diagnostic assistant.
            You must reply ONLY in ${targetLanguage}.

            STRICT RULES:
            - ALWAYS return ONLY a valid JSON object.
            - NO markdown formatting, NO backticks (like \`\`\`json), NO plain text outside the JSON.
            
            SCENARIO 1: GENERAL CHAT (Greetings, casual questions like "Hi", "How are you?")
            If the user is just chatting and not asking a medical question, return exactly this JSON:
            {
                "disease": "General Query",
                "message": "Your helpful conversational response here in ${targetLanguage}."
            }

            SCENARIO 2: MEDICAL QUERY (Symptoms, Lab Reports, Images)
            If the user asks a medical question or uploads a report:
            - Determine if the patient is a PET (Dog, Cat) or HUMAN.
            - If PET: Recommend 'Veterinarian'. If HUMAN: Recommend a specific specialist (e.g., 'Cardiologist').
            Return exactly this JSON:
            {
                "disease": "Likely Condition Name (in ${targetLanguage})",
                "confidence": "Match percentage (e.g. 90%)",
                "severity": "Low/Medium/High/Critical",
                "symptoms": ["symptom 1", "symptom 2"],
                "findings": "A professional 2-3 sentence summary of the analysis in ${targetLanguage}.",
                "doctorType": "Recommended Specialist Name"
            }
        `;

        // CHAT MEMORY LOGIC: Fetch previous messages if chatId is provided
        let previousContext = "";
        let existingChat = null;

        if (chatId && userId) {
            existingChat = await ChatHistory.findOne({ _id: chatId, userId: userId });
            if (existingChat && existingChat.messages && existingChat.messages.length > 0) {
                // Get the last 6 messages to provide context
                const historyText = existingChat.messages.slice(-6).map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');
                previousContext = `\n--- PREVIOUS CHAT HISTORY (For context) ---\n${historyText}\n-------------------------------------------\n\n`;
            }
        }

        // Prepare prompt
        const parts = [
            { text: systemInstruction },
            { text: `${previousContext}CURRENT USER INPUT: ${prompt || "Analyze the attached document."}` }
        ];

        // Handle File Attachment (Image, PDF, or Word)
        if (imageBase64) {
            try {
                const mimeType = imageBase64.split(';')[0].split(':')[1];
                const base64Data = imageBase64.replace(/^data:.*;base64,/, "");

                if (mimeType.includes('wordprocessingml.document')) {
                    console.log("📎 Word Document detected. Extracting text...");
                    const buffer = Buffer.from(base64Data, 'base64');
                    const textResult = await mammoth.extractRawText({ buffer: buffer });
                    const extractedText = textResult.value;

                    parts.push({ 
                        text: `\n[EXTRACTED WORD DOCUMENT CONTENT]:\n${extractedText}\n\nPlease analyze the above medical document content.` 
                    });
                } else {
                    parts.push({
                        inlineData: { data: base64Data, mimeType: mimeType }
                    });
                    console.log(`📎 Image/PDF detected: ${mimeType}`);
                }
            } catch (fileErr) {
                console.error("File processing error:", fileErr);
                return res.status(400).json({ message: "File processing failed. Ensure it's a valid Image, PDF, or .docx file." });
            }
        }

        console.log(`⏳ Sending request to Gemini AI... (Language: ${targetLanguage}, Chat Mode: ${chatId ? 'Resume' : 'New'})`);
        
        const result = await model.generateContent(parts);
        const responseText = (await result.response).text();

        // Clean JSON formatting
        const cleanJsonString = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        try {
            const finalData = JSON.parse(cleanJsonString);
            console.log("✅ AI Response Success:", finalData.disease);

            let currentChatId = chatId; 

            // 💾 SAVE TO DATABASE: Update existing chat OR create a new one
            if (userId) {
                try {
                    let aiReply = finalData.message || finalData.findings;
                    const msgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    const newMessages = [
                        { id: Date.now().toString(), sender: 'user', text: prompt || "Uploaded a document.", type: imageBase64 ? 'document' : 'text', time: msgTime },
                        { id: (Date.now() + 1).toString(), sender: 'ai', text: aiReply, type: (finalData.disease && finalData.disease !== "General Query") ? 'report' : 'text', data: finalData, time: msgTime }
                    ];

                    if (existingChat) {
                        // 🔄 UPDATE EXISITNG CHAT
                        existingChat.messages.push(...newMessages);
                        if (finalData.disease && finalData.disease !== "General Query") {
                            existingChat.data = finalData; 
                        }
                        await existingChat.save();
                        currentChatId = existingChat._id;
                    } else {
                        // ✨ CREATE NEW CHAT
                        let chatTitle = "General Chat";
                        if (finalData.disease && finalData.disease !== "General Query") {
                            chatTitle = finalData.disease;
                        } else if (prompt) {
                            chatTitle = prompt.substring(0, 25) + "...";
                        }

                        const newChat = await ChatHistory.create({
                            userId: userId,
                            title: chatTitle,
                            data: finalData,
                            messages: newMessages
                        });
                        currentChatId = newChat._id;
                    }
                } catch (dbErr) {
                    console.error("Warning: Could not save to database:", dbErr.message);
                }
            }
            
            res.status(200).json({ ...finalData, chatId: currentChatId });

        } catch (parseError) {
            console.error("JSON Parsing Error. Raw AI Output:", responseText);
            res.status(500).json({ message: "AI returned an unreadable format. Please try again." });
        }

    } catch (error) {
        console.error("❌ AI Controller Error:", error.message);
        if (error.message.includes("429") || error.message.includes("quota")) {
            return res.status(429).json({ message: "AI is busy. Wait 30 seconds." });
        }
        if (error.message.includes("403") || error.message.includes("key")) {
            return res.status(401).json({ message: "API Key Error/Leaked. Check .env." });
        }
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/**
 * 2. GET HISTORY LIST CONTROLLER (For Sidebar)
 */
exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.userId || (req.user && req.user._id) || (req.user && req.user.id) || req.user;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const history = await ChatHistory.find({ userId: userId })
            .sort({ createdAt: -1 })
            .select('title createdAt data'); // 🚨 NAYA: 'data' add kiya hai
            
        const formattedHistory = history.map(item => ({
            id: item._id,
            title: item.title,
            data: item.data, // 🚨 NAYA: data frontend ko bhej rahe hain
            date: new Date(item.createdAt).toLocaleDateString()
        }));

        res.status(200).json({ history: formattedHistory });
    } catch (error) {
        res.status(500).json({ message: "Failed to load history." });
    }
};

/**
 * 🚨 3. GET SINGLE CHAT CONTROLLER (To load full chat when clicked in Sidebar)
 */
exports.getSingleChat = async (req, res) => {
    try {
        const userId = req.userId || (req.user && req.user._id) || (req.user && req.user.id) || req.user;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const chat = await ChatHistory.findOne({ _id: req.params.id, userId: userId });
        
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        res.status(200).json({ chat });
    } catch (error) {
        res.status(500).json({ message: "Failed to load chat details." });
    }
};

/**
 * 4. CLEAR ALL HISTORY CONTROLLER
 */
exports.clearChatHistory = async (req, res) => {
    try {
        const userId = req.userId || (req.user && req.user._id) || (req.user && req.user.id) || req.user;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        await ChatHistory.deleteMany({ userId: userId });
        res.status(200).json({ message: "History cleared successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear history." });
    }
};