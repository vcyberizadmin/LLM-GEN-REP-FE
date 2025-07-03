import { z } from "zod";

/* ------------------------------------------------------------------ */
/* 1 / Schema                                                         */
/* ------------------------------------------------------------------ */

/**
 * Zod schema for a single incident bucket.
 */
const IncidentBucketSchema = z
  .object({
    category: z.string(),
    severity: z.enum(["High", "Medium", "Low"]),
    count: z.number().int().nonnegative(),
    examples: z.array(z.string()).max(5).default([]),
  })
  .strict();

/**
 * Zod schema for the full incident summary.
 * Root is an array of IncidentBucket objects.
 */
const IncidentSummarySchema = z.array(IncidentBucketSchema).strict();

/** Export TypeScript types inferred from the Zod schema. */
export type IncidentBucket = z.infer<typeof IncidentBucketSchema>;
export type IncidentSummary = z.infer<typeof IncidentSummarySchema>;

/* ------------------------------------------------------------------ */
/* 2 / Sanitiser                                                      */
/* ------------------------------------------------------------------ */

const FENCE_RE = /^```(?:json)?\s*|\s*```$/gm;

/**
 * Strip common ```json fences and surrounding whitespace.
 * Returns a candidate JSON string or `null` if input is falsy.
 */
export function stripJsonFence(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const stripped = raw.replace(FENCE_RE, "").trim();
  return stripped.length ? stripped : null;
}

/* ------------------------------------------------------------------ */
/* 3 / Parser + Self-repair Loop                                      */
/* ------------------------------------------------------------------ */

/**
 * Parse and validate an Incident Summary coming from the LLM.
 *
 * @param raw         Raw LLM text (may contain markdown fences).
 * @param repairFn    `(errorMsg) => Promise<string>` that calls the LLM
 *                    again with a low-temperature “repair prompt” and
 *                    returns its *raw* text reply.
 * @param maxAttempts Maximum repair cycles (default 2).
 *
 * @throws {Error}    If valid JSON cannot be produced after retries.
 */
export async function parseIncidentSummary(
  raw: string,
  repairFn: (errorMsg: string) => Promise<string>,
  maxAttempts = 2,
): Promise<IncidentSummary> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt += 1;

    const candidate = stripJsonFence(raw);
    if (candidate) {
      try {
        const parsed = JSON.parse(candidate);
        /** zod parse throws if invalid – perfect for fast-fail. */
        return IncidentSummarySchema.parse(parsed);
      } catch (err) {
        // fallthrough – will trigger repair below
      }
    }

    if (attempt > maxAttempts) {
      throw new Error(
        "Unable to produce valid IncidentSummary JSON after " +
          `${maxAttempts} repair attempts.`,
      );
    }

    // Feed minimal error back to the model via the supplied repairFn.
    raw = await repairFn("schema mismatch");
  }
}

/* ------------------------------------------------------------------ */
/* 4 / Handy test/demo (tree-shaken out in prod)                      */
/* ------------------------------------------------------------------ */

if (import.meta.vitest) {
  const { it, expect, vi } = import.meta.vitest;

  it("repairs malformed output", async () => {
    const badOutput = `
      \`\`\`json
      { "category": "Malware", "severity": "High", "count": "2" }
      \`\`\`
    `;

    const goodOutput =
      '[{"category":"Malware","severity":"High","count":2,"examples":["INC-1"]}]';

    const repairFn = vi.fn().mockResolvedValue(goodOutput);

    const summary = await parseIncidentSummary(badOutput, repairFn);
    expect(summary[0].count).toBe(2);
    expect(repairFn).toHaveBeenCalledTimes(1);
  });
}
