const OpenAI = require("openai");

let client = null;

const getClient = () => {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      const err = new Error(
        "OPENAI_API_KEY is not configured. Add it to backend/.env."
      );
      err.statusCode = 503;
      throw err;
    }

    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return client;
};

const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

async function askAI(prompt) {
  const response = await getClient().chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content.trim();
}

async function generateTags({
  recipeName,
  ingredients,
  instructions,
  curatedTags,
}) {
  const prompt = `You are tagging a recipe.

Recipe: ${recipeName}

Ingredients:
${ingredients.join(", ")}

Instructions:
${instructions.join("\n")}

Preferred tags:
${curatedTags.join(", ")}

Return ONLY a JSON array of 3-6 lowercase tags.`;

  const result = await askAI(prompt);
  return JSON.parse(result.replace(/```json|```/g, ""));
}

async function generateSummary({
  recipeName,
  country,
  state,
  ingredients,
  instructions,
  tags,
}) {
  const prompt = `Write a short 2-3 sentence summary.

Recipe: ${recipeName}
Origin: ${state}, ${country}
Tags: ${tags.join(", ")}

Ingredients:
${ingredients.join(", ")}

Instructions:
${instructions.join("\n")}

Return only the summary.`;

  return await askAI(prompt);
}

async function rankSimilarRecipes({ target, candidates }) {
  const prompt = `
Target Recipe:
${target.recipeName}

Tags:
${target.tags.join(", ")}

Ingredients:
${target.ingredients.join(", ")}

Candidates:
${candidates
  .map(
    (c, i) =>
      `${i}. ${c.recipeName} | Tags: ${c.tags.join(", ")} | Ingredients: ${c.ingredients.join(", ")}`
  )
  .join("\n")}

Return ONLY JSON like:
[
 {"index":0,"reason":"similar spices"}
]
`;

  const result = await askAI(prompt);
  return JSON.parse(result.replace(/```json|```/g, ""));
}

module.exports = {
  generateTags,
  generateSummary,
  rankSimilarRecipes,
};