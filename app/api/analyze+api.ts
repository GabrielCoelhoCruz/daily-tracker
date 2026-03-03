type AnalyzeRequestBody = {
  photos: { base64: string; label: string }[];
  systemPrompt: string;
  userPrompt: string;
  athleteProfile: {
    name: string;
    gender: string;
    heightCm: number;
    currentWeightKg: number;
    phase?: string;
    coachName?: string;
  };
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "ANTHROPIC_API_KEY not configured" }, 500);
  }

  let body: AnalyzeRequestBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!body.photos?.length) {
    return jsonResponse({ error: "At least 1 photo is required" }, 400);
  }
  if (!body.athleteProfile?.name || !body.athleteProfile?.gender) {
    return jsonResponse({ error: "Athlete name and gender are required" }, 400);
  }
  if (
    typeof body.athleteProfile.heightCm !== "number" ||
    typeof body.athleteProfile.currentWeightKg !== "number"
  ) {
    return jsonResponse({ error: "heightCm and currentWeightKg must be numbers" }, 400);
  }

  const content: Array<
    | { type: "image"; source: { type: "base64"; media_type: "image/jpeg"; data: string } }
    | { type: "text"; text: string }
  > = [];

  for (const photo of body.photos) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: photo.base64 },
    });
    content.push({ type: "text", text: photo.label });
  }

  content.push({ type: "text", text: body.userPrompt });

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 8192,
        system: body.systemPrompt,
        messages: [{ role: "user", content }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      return jsonResponse(
        { error: `Claude API error (${response.status}): ${errorBody}` },
        response.status
      );
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text;
    if (typeof text !== "string") {
      return jsonResponse({ error: "Unexpected response from Claude API" }, 502);
    }

    return jsonResponse({ analysis: text });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return jsonResponse({ error: "Claude API request timed out (120s)" }, 504);
    }
    return jsonResponse({ error: "Failed to reach Claude API" }, 502);
  } finally {
    clearTimeout(timeoutId);
  }
}
