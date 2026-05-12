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
    throw new Error(
      error instanceof Error ? error.message : "Failed to get response from Gemini"
    );
  }
}

export async function generateDeploymentAnalysis(
  repo: string,
  service: string,
  region: string,
  budget: string,
  userRequest: string
): Promise<string> {
  const systemPrompt = `You are DeployBuddy AI, an expert deployment advisor. Analyze deployment requests and provide comprehensive recommendations including architecture, providers, regions, resources, and cost estimates.

IMPORTANT: Return ONLY a valid JSON object with NO markdown, NO backticks, and NO commentary outside the JSON.`;

  const userPrompt = `Analyze this deployment request and return ONLY a valid JSON object (no markdown, no backticks):

{
  "stack_detected": ["Framework", "Language", "Database"],
  "architecture": "Architecture name",
  "providers": "Provider1 (role) + Provider2 (role)",
  "region": "${region}",
  "resources": "X vCPU · Y GB RAM",
  "deployment_type": "Type",
  "risk": "Short risk description",
  "risk_level": "low" | "medium" | "high",
  "summary": "2–3 sentence analysis",
  "warning": "Budget/scale concern string, or null",
  "estimated_cost": {
    "monthly_min": 0,
    "monthly_max": 0,
    "currency": "USD",
    "breakdown": [
      { "item": "Service name", "cost": "$X/mo" }
    ],
    "within_budget": true | false,
    "budget_note": "Short note comparing estimate to user budget"
  },
  "alternatives": [
    {
      "provider": "Alternative provider name",
      "architecture": "Brief architecture description",
      "monthly_estimate": "$X–$Y/mo",
      "pros": ["pro1", "pro2"],
      "cons": ["con1", "con2"],
      "best_for": "Use case this alternative excels at"
    }
  ],
  "feasibility": { "budget": 0-100, "scalability": 0-100, "reliability": 0-100, "ease_of_setup": 0-100 }
}

Repository: ${repo}
Service type: ${service}
Target region: ${region}
Monthly budget: $${budget} USD
Request: ${userRequest}

Provide 2 alternatives to the main recommended provider (e.g., if AWS is main, suggest GCP and Azure or Vercel/Railway). 
Estimated costs must be realistic and account for the monthly budget of $${budget} USD.`;

  return chatWithGemini(userPrompt, systemPrompt);
}

export async function generateFollowUpResponse(
  userMessage: string,
  context: {
    repo: string;
    service: string;
    region: string;
    budget?: string;
    previousAnalysis?: Record<string, unknown>;
  }
): Promise<string> {
  const systemPrompt = `You are DeployBuddy AI, a helpful deployment advisor. Provide conversational, practical advice about deployments. Be concise and actionable.`;

  const contextStr = context.previousAnalysis
    ? `Previous analysis: ${JSON.stringify(context.previousAnalysis)}`
    : "";

  const userPrompt = `${contextStr}

Repository: ${context.repo}
Service type: ${context.service}
Region: ${context.region}
Monthly budget: $${context.budget ?? "unspecified"} USD

User message: ${userMessage}

Reply conversationally in 2–4 sentences with practical advice. No JSON needed.`;

  return chatWithGemini(userPrompt, systemPrompt);
}