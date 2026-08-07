import { generateObject } from "ai";
import { z } from "zod";
import { google } from "./gemini";
import { performWebSearch } from "./tools";

export async function verifyClaim(content, sourceUrl, image) {

  const groundedModel = google("models/gemini-2.5-flash");

  // Generate Search Queries
  let queries = [];

  try {

    const queryGenResult = await generateObject({
      model: groundedModel,
      schema: z.object({
        queries: z.array(z.string()).min(1).max(2)
      }),
      prompt: `You are an expert fact-checker.

Claim:
"${content}"

${sourceUrl ? `Source URL: ${sourceUrl}` : ""}

Generate 1 or 2 search queries to verify this claim.`
    });

    queries = queryGenResult.object.queries;

  } catch (e) {

    queries = [
      content.length > 80 ? content.substring(0, 80) : content
    ];

  }

  // Gather Search Evidence
  let searchResults = [];
  const uniqueUrls = new Set();

  const searchPromises = queries.map(async (q, index) => {

    if (index > 0)
      await new Promise(r => setTimeout(r, index * 1500));

    return performWebSearch(q);

  });

  const resultsArray = await Promise.all(searchPromises);

  for (const results of resultsArray) {

    for (const r of results) {

      if (!uniqueUrls.has(r.url)) {

        uniqueUrls.add(r.url);
        searchResults.push(r);

      }

    }

  }

  searchResults = searchResults.slice(0, 6);

  const evidenceContext = searchResults
    .map(r => `Source: ${r.title}\nURL: ${r.url}\nSnippet: ${r.description}`)
    .join("\n\n");

  // Build AI message
  const messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `
You are Veracity AI fact checker.

CLAIM:
"${content}"

${sourceUrl ? `SOURCE URL: ${sourceUrl}` : ""}

EVIDENCE:
${evidenceContext || "No evidence found"}

Decide TRUE, FALSE, or INCONCLUSIVE.
Provide confidence 0-1 and a short explanation.
`
        }
      ]
    }
  ];

  // Add image if provided
  if (image) {

    const imageUrl = new URL(
      `data:${image.mimeType};base64,${image.base64}`
    );

    messages[0].content.push({
      type: "image",
      image: imageUrl
    });

  }

  // Run AI verification
  const result = await generateObject({

    model: groundedModel,

    schema: z.object({

      reasoning: z.string(),

      verdict: z.enum([
        "TRUE",
        "FALSE",
        "INCONCLUSIVE"
      ]),

      confidence: z.number().min(0).max(1),

      summary: z.string(),

      sourcesUsed: z.array(
        z.object({
          title: z.string(),
          url: z.string()
        })
      )

    }),

    messages

  });

  return {

    verdict: result.object.verdict,
    confidence: result.object.confidence,
    reasoning: result.object.reasoning,
    summary: result.object.summary,
    sources: result.object.sourcesUsed

  };

}