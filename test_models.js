import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const match = envFile.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) {
    console.log("No API Key found.");
    process.exit(1);
}

async function listAllModels() {
    try {
        console.log("Fetching models...");
        // Wait, listing models isn't directly exposed on basic GoogleGenerativeAI in some versions easily.
        // I will use fetch to call the REST API directly since it's the most reliable way.
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        
        if (data.models) {
            console.log("--- BẢNG DANH SÁCH CÁC MODEL KHẢ DỤNG ---");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("Response:", data);
        }
    } catch (e) {
        console.error("Lỗi:", e.message);
    }
}

listAllModels();
