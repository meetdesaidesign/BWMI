import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  image: z.string().startsWith("data:image/").max(11_000_000),
});

const extractionSchema = z.object({
  category: z.enum(["Roads", "Waste", "Water", "Lighting", "Drainage"]),
  title_en: z.string().min(4).max(90),
  title_hi: z.string().min(2).max(120),
  description_en: z.string().min(8).max(260),
  description_hi: z.string().min(4).max(320),
  severity: z.enum(["low", "medium", "high"]),
  confidence: z.number().min(0).max(1),
  needs_user_review: z.boolean(),
  duplicate_id: z.string().nullable(),
});

const demoFallback = {
  category: "Roads" as const,
  title_en: "Deep pothole near the road edge",
  title_hi: "सड़क किनारे गहरा गड्ढा",
  description_en: "A damaged section of road may be hazardous for two-wheelers and needs inspection.",
  description_hi: "सड़क का क्षतिग्रस्त हिस्सा दोपहिया वाहनों के लिए खतरनाक हो सकता है और इसकी जाँच आवश्यक है।",
  severity: "high" as const,
  confidence: 0.86,
  needs_user_review: false,
  duplicate_id: "PK-14028",
  demoFallback: true,
};

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    if (!process.env.OPENAI_API_KEY) return NextResponse.json(demoFallback);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      store: false,
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: "Classify this civic issue photo for an Indian municipal reporting app. Be factual, avoid identifying people, and do not infer sensitive personal details. Write concise English and natural Hindi. Choose the closest allowed category. Set needs_user_review when the image is unclear. duplicate_id should be PK-14028 only for a visible pothole, otherwise null." },
          { type: "input_image", image_url: body.image, detail: "low" },
        ],
      }],
      text: {
        format: {
          type: "json_schema",
          name: "civic_issue_extraction",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              category: { type: "string", enum: ["Roads", "Waste", "Water", "Lighting", "Drainage"] },
              title_en: { type: "string" }, title_hi: { type: "string" },
              description_en: { type: "string" }, description_hi: { type: "string" },
              severity: { type: "string", enum: ["low", "medium", "high"] },
              confidence: { type: "number", minimum: 0, maximum: 1 },
              needs_user_review: { type: "boolean" },
              duplicate_id: { type: ["string", "null"] },
            },
            required: ["category", "title_en", "title_hi", "description_en", "description_hi", "severity", "confidence", "needs_user_review", "duplicate_id"],
          },
        },
      },
    });

    const parsed = extractionSchema.parse(JSON.parse(response.output_text));
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Pakka image analysis failed", error);
    return NextResponse.json({ error: "Unable to analyze this image" }, { status: 422 });
  }
}
