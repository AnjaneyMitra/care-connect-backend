import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            this.logger.warn("GEMINI_API_KEY not found. AI matching will be disabled.");
        } else {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
    }

    async getMatchingRecommendations(
        requestData: any,
        candidateNannies: any[],
        historicalData: any[],
    ): Promise<Map<string, number>> {
        if (!this.genAI) {
            this.logger.warn("Gemini API not configured. Returning default scores.");
            return new Map();
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

            const prompt = `
You are an AI matching assistant for a childcare platform. Analyze the following data and provide AI-based scoring for each nanny candidate.

REQUEST DETAILS:
- Required Skills: ${JSON.stringify(requestData.required_skills)}
- Children Ages: ${JSON.stringify(requestData.children_ages)}
- Special Requirements: ${requestData.special_requirements || "None"}
- Duration: ${requestData.duration_hours} hours

CANDIDATE NANNIES:
${candidateNannies.map((n, i) => `
Nanny ${i + 1} (ID: ${n.id}):
- Skills: ${JSON.stringify(n.skills)}
- Experience: ${n.experience_years} years
- Hourly Rate: $${n.hourly_rate}
- Distance: ${n.distance?.toFixed(2)} km
- Acceptance Rate: ${n.acceptance_rate}%
`).join("\n")}

HISTORICAL SUCCESSFUL MATCHES (for learning):
${historicalData.slice(0, 10).map((h) => `
- Request Skills: ${JSON.stringify(h.request_skills)} → Matched with Nanny (Experience: ${h.nanny_experience} years, Skills: ${JSON.stringify(h.nanny_skills)}) → Success: ${h.was_successful}
`).join("\n")}

Based on the historical data patterns and the current request, provide an AI score (0-100) for each nanny. Consider:
1. Skill match quality (not just presence, but relevance)
2. Experience level appropriateness for the children's ages
3. Historical patterns of successful matches
4. Balance between quality and affordability

Respond ONLY with a JSON object mapping nanny IDs to scores:
{"nannyId1": score1, "nannyId2": score2, ...}
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\{[^}]+\}/);
            if (jsonMatch) {
                const scores = JSON.parse(jsonMatch[0]);
                return new Map(Object.entries(scores).map(([k, v]) => [k, Number(v)]));
            }

            this.logger.warn("Could not parse AI response. Returning empty scores.");
            return new Map();
        } catch (error) {
            this.logger.error(`AI matching error: ${error.message}`);
            return new Map();
        }
    }
}
