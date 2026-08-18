/**
 * Turns scraped strings into canonical values. Everything here is a heuristic,
 * which is exactly why imported records stay `unverified` until a human looks.
 */
import type { AwardType } from "../../src/schemas";

const AWARD_RULES: [RegExp, AwardType][] = [
  [/grand\s*prize/i, "grand-prize"],
  [/\b(1st|first)\b/i, "first-place"],
  [/\b(2nd|second)\b/i, "second-place"],
  [/\b(3rd|third)\b/i, "third-place"],
  [/honorable\s*mention/i, "honorable-mention"],
  [/audience|people'?s\s*choice/i, "audience-choice"],
  [/community\s*choice/i, "community-choice"],
  [/finalist/i, "finalist"],
  [/sponsor|presented\s+by|powered\s+by/i, "sponsor-prize"],
  [/track/i, "track-winner"],
  [/\bbest\b|\bmost\b|category/i, "category-winner"],
  [/winner/i, "winner"],
];

export function awardTypeFor(title: string): AwardType {
  for (const [pattern, type] of AWARD_RULES) if (pattern.test(title)) return type;
  return "other";
}

/** Devpost theme names and free text mapped onto our controlled categories. */
const CATEGORY_RULES: [RegExp, string][] = [
  [/machine\s*learning|artificial\s*intelligence|\bai\b|\bllm\b|generative/i, "artificial-intelligence"],
  [/health|medical|medicine|wellness/i, "healthcare"],
  [/education|learning|student/i, "education"],
  [/fintech|finance|banking|payments/i, "fintech"],
  [/security|cyber|privacy/i, "cybersecurity"],
  [/climate|environment|carbon/i, "climate"],
  [/sustainab/i, "sustainability"],
  [/accessib|disabilit/i, "accessibility"],
  [/developer\s*tool|devtool|productivity\s*tool/i, "developer-tools"],
  [/productivity|workflow/i, "productivity"],
  [/social\s*(good|impact)|nonprofit|humanitarian/i, "social-impact"],
  [/robot/i, "robotics"],
  [/\biot\b|internet\s*of\s*things|hardware/i, "iot"],
  [/\bar\b|\bvr\b|augmented|virtual\s*reality|metaverse/i, "ar-vr"],
  [/game|gaming/i, "gaming"],
  [/defi/i, "defi"],
  [/web3|nft|dao/i, "web3"],
  [/blockchain|crypto/i, "blockchain"],
  [/data\s*(science|analytics|visualization)/i, "data"],
  [/cloud/i, "cloud"],
  [/infrastructure|devops/i, "infrastructure"],
  [/e-?commerce|retail|shopping/i, "e-commerce"],
  [/transport|mobility|automotive/i, "transportation"],
  [/gov|civic|public\s*sector/i, "govtech"],
  [/media|video|music|content/i, "media"],
  [/design|creative/i, "creative-tools"],
  [/enterprise|\bb2b\b/i, "enterprise"],
  [/consumer/i, "consumer"],
];

export function categoriesFor(text: string, known: Set<string>): string[] {
  const found = new Set<string>();
  for (const [pattern, slug] of CATEGORY_RULES) {
    if (pattern.test(text) && known.has(slug)) found.add(slug);
    if (found.size >= 3) break;
  }
  if (!found.size && known.has("other")) found.add("other");
  return [...found];
}

/**
 * A factual, original sentence built from structured fields. We never copy the
 * source's own description — the dataset license only covers our own prose.
 */
export function generatedSummary(input: {
  name: string;
  awardTitle: string;
  hackathonName: string;
  year: number | null;
}): string {
  const when = input.year ? ` in ${input.year}` : "";
  return (
    `${input.name} received the ${input.awardTitle} award at ${input.hackathonName}${when}. ` +
    "This record was imported automatically; the summary and source check are still pending."
  );
}
