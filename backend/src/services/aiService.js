const { GoogleGenerativeAI } = require("@google/generative-ai");

const estimatePrice = async (propertyData) => {
    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key, return null to use the local fallback
    if (!apiKey) {
        console.warn("GEMINI_API_KEY is missing. Using local estimation logic.");
        return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { city, surface, rooms, type, category, transaction } = propertyData;

    const prompt = `En tant qu'expert immobilier tunisien, estime le prix d'un bien avec les caractéristiques suivantes :
    - Ville : ${city}
    - Type : ${type} (${rooms})
    - Surface : ${surface} m²
    - Transaction : ${transaction}
    - Catégorie : ${category}

    Donne-moi une réponse au format JSON uniquement, sans texte autour, avec la structure suivante :
    {
      "avg": nombre,
      "min": nombre,
      "max": nombre,
      "currency": "TND",
      "analysis": "une phrase d'explication courte"
    }
    Assure-toi que les prix sont réalistes par rapport au marché tunisien actuel de 2024-2025.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from the text (Gemini sometimes adds markdown backticks)
        const jsonMatch = text.match(/\{.*\}/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini AI error:", error);
        return null;
    }
};

module.exports = { estimatePrice };
