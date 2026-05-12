import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const GEMINI_MODEL = "gemini-2.5-flash";

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function chatWithGemini(
  userMessage: string,
  systemPrompt?: string
): Promise<string> {

  try {
    const result = await generateText({
      model: google(GEMINI_MODEL),
      system: systemPrompt,
      prompt: userMessage,
      temperature: 0.7,
    });

    return result.text;
  } catch (error) {
    console.error("Gemini API error detail:", JSON.stringify(error));
    console.error("API Key exists:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    throw new Error(
      error instanceof Error ? error.message : "Failed to get response from Gemini"
    );
  }
}

export async function generateDeploymentAnalysis(
  repo: string,
  service: string,
  region: string,
  userRequest: string
): Promise<string> {
  const systemPrompt = `You are DeployBuddy AI, an expert deployment advisor. Analyze deployment requests and provide comprehensive recommendations including architecture, providers, regions, and resources.

IMPORTANT: Return ONLY a valid JSON object with NO markdown, NO backticks, and NO commentary outside the JSON.`;

  const userPrompt = `Analyze this deployment request and return ONLY a valid JSON object:

{
  "stack_detected":  ["Framework", "Language", "Database"],
  "architecture":    "Architecture name",
  "providers":       "Provider1 (role) + Provider2 (role)",
  "region":          "${region}",
  "resources":       "X vCPU · Y GB RAM",
  "deployment_type": "Type",
  "risk":            "Short risk description",
  "risk_level":      "low" | "medium" | "high",
  "summary":         "2–3 sentence analysis",
  "warning":         "Budget/scale concern string, or null",
  "feasibility": { "budget": 0-100, "scalability": 0-100, "reliability": 0-100, "ease_of_setup": 0-100 }
}

Repository: ${repo}
Service type: ${service}
Target region: ${region}
Request: ${userRequest}`;

  return chatWithGemini(userPrompt, systemPrompt);
}

export async function generateFollowUpResponse(
  userMessage: string,
  context: {
    repo: string;
    service: string;
    region: string;
    previousAnalysis?: Record<string, unknown>;
  }
): Promise<string> {
  const systemPrompt = `You are DeployBuddy AI, a helpful deployment advisor. Provide conversational, practical advice about deployments.`;

  const contextStr = context.previousAnalysis
    ? `Previous analysis: ${JSON.stringify(context.previousAnalysis)}`
    : "";

  const userPrompt = `${contextStr}

Repository: ${context.repo}
Service type: ${context.service}
Region: ${context.region}

User message: ${userMessage}

Reply conversationally in 2–4 sentences with practical advice. No JSON needed.`;

  return chatWithGemini(userPrompt, systemPrompt);
}
