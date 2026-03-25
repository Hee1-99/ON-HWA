const { GoogleGenerativeAI } = require('@google/generative-ai');

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const response = await ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // just checking
    console.log("Fetching models...");
    let result = '';
    // Actually the SDK has a method to get models, but maybe not in getGenerativeModel
    // Wait, the SDK doesn't expose listModels natively in simple way, we can just fetch it manually
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    console.log("Available models:", data.models?.map(m => m.name).join(', ') || data);
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}

run();
