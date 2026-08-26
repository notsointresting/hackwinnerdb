import { describe, expect, it } from "vitest";
import { awardTypeFor, categoriesFor, generatedSummary } from "../scripts/import/classify";
import { extractImage, mapTechnologies, parseGallery, parseProject } from "../scripts/import/devpost-parse";
import { parseSubmissionDates, yearFromDates } from "../scripts/import/discover";
import { parseHackathon } from "../scripts/import/devpost-parse";

describe("import classify helpers", () => {
  it("classifies awards accurately", () => {
    expect(awardTypeFor("Grand Prize Winner")).toBe("grand-prize");
    expect(awardTypeFor("1st Place Overall")).toBe("first-place");
    expect(awardTypeFor("Second Place")).toBe("second-place");
    expect(awardTypeFor("3rd Place")).toBe("third-place");
    expect(awardTypeFor("Honorable Mention")).toBe("honorable-mention");
    expect(awardTypeFor("Audience Choice Award")).toBe("audience-choice");
    expect(awardTypeFor("Community Choice")).toBe("community-choice");
    expect(awardTypeFor("Finalist Award")).toBe("finalist");
    expect(awardTypeFor("Best AI App Presented by Google")).toBe("sponsor-prize");
    expect(awardTypeFor("Best Developer Tool Track")).toBe("track-winner");
    expect(awardTypeFor("Best Healthcare App")).toBe("category-winner");
    expect(awardTypeFor("Overall Winner")).toBe("winner");
    expect(awardTypeFor("Surprise Recognition")).toBe("other");
  });

  it("extracts categories against known taxonomy", () => {
    const known = new Set(["artificial-intelligence", "healthcare", "productivity", "other"]);
    const categories = categoriesFor("An AI assistant for medical note productivity", known);
    expect(categories).toContain("artificial-intelligence");
    expect(categories).toContain("healthcare");
    expect(categories).toContain("productivity");
  });

  it("falls back to other category if no matches found", () => {
    const known = new Set(["gaming", "other"]);
    const categories = categoriesFor("Unrelated obscure widget", known);
    expect(categories).toEqual(["other"]);
  });

  it("generates factual summary without copying source prose", () => {
    const summary = generatedSummary({
      name: "MedSafe",
      awardTitle: "Grand Prize",
      hackathonName: "Google AI Hackathon",
      year: 2024,
    });
    expect(summary).toContain("MedSafe received the Grand Prize award at Google AI Hackathon in 2024.");
    expect(summary).toContain("imported automatically");
  });
});

describe("import devpost-parse helpers", () => {
  it("extracts year from submission dates", () => {
    expect(yearFromDates("Jul 01 - Aug 01, 2024")).toBe(2024);
    expect(yearFromDates("March 2025")).toBe(2025);
    expect(yearFromDates("Invalid Date Format")).toBeNull();
    expect(yearFromDates(null)).toBeNull();
  });

  it("maps known technologies and segregates unknown ones", () => {
    const known = new Set(["react", "python", "tailwind-css"]);
    const result = mapTechnologies(["React", "Python", "Tailwind CSS", "ObscureFrameworkX"], known);
    expect(result.mapped).toEqual(["react", "python", "tailwind-css"]);
    expect(result.unknown).toEqual(["obscureframeworkx"]);
  });

  it("parses sample gallery HTML with winner ribbons", () => {
    const html = `
      <div data-software-id="12345">
        <span class="winner">Winner</span>
        <a href="https://devpost.com/software/super-app">
          <h5>Super App</h5>
        </a>
        <p class="small tagline">Revolutionary AI tool</p>
        <img alt="Jane Doe" class="user-photo" src="https://example.com/avatar.jpg" />
        <img alt="John Smith" class="user-photo" src="https://example.com/avatar2.jpg" />
      </div>
      <div data-software-id="67890">
        <a href="https://devpost.com/software/non-winner">
          <h5>Non Winner</h5>
        </a>
      </div>
    `;

    const projects = parseGallery(html);
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe("Super App");
    expect(projects[0].slug).toBe("super-app");
    expect(projects[0].tagline).toBe("Revolutionary AI tool");
    expect(projects[0].builders).toEqual(["Jane Doe", "John Smith"]);
  });

  it("parses sample project detail HTML", () => {
    const html = `
      <div class="software-list-content">
        <a href="https://googleai.devpost.com/">Google AI Hackathon</a>
        <ul>
          <li><span class="winner">Winner</span> Grand Prize Winner</li>
        </ul>
      </div>
      <div id="built-with">
        <ul>
          <li><span class="cp-tag">React</span></li>
          <li><span class="cp-tag">Python</span></li>
        </ul>
      </div>
      <nav id="app-links">
        <a href="https://superapp.com">Website</a>
      </nav>
      <a href="https://github.com/example/superapp">GitHub</a>
      <a href="https://www.youtube.com/watch?v=12345">Video</a>
    `;

    const detail = parseProject(html);
    expect(detail.awards).toHaveLength(1);
    expect(detail.awards[0].title).toBe("Grand Prize Winner");
    expect(detail.awards[0].hackathonName).toBe("Google AI Hackathon");
    expect(detail.technologies).toEqual(["React", "Python"]);
    expect(detail.links.website).toBe("https://superapp.com");
    expect(detail.links.github).toBe("https://github.com/example/superapp");
    expect(detail.links.video).toBe("https://www.youtube.com/watch?v=12345");
  });

  it("extracts images from metadata and ignores placeholders", () => {
    const htmlWithOg = `<meta property="og:image" content="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/005/115/697/datas/gallery.jpg" />`;
    expect(extractImage(htmlWithOg)).toBe(
      "https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/005/115/697/datas/gallery.jpg",
    );

    const htmlWithPlaceholder = `<meta property="og:image" content="https://d2dmyh35ffsxbl.cloudfront.net/assets/defaults/thumbnail-placeholder-123.gif" />`;
    expect(extractImage(htmlWithPlaceholder)).toBeNull();

    const htmlWithSocialIcon = `<meta property="og:image" content="https://d2dmyh35ffsxbl.cloudfront.net/assets/shared/devpost_social_icon_200_200.jpg" />`;
    expect(extractImage(htmlWithSocialIcon)).toBeNull();
  });
});

describe("parseSubmissionDates", () => {
  it("reads a cross-month window", () => {
    expect(parseSubmissionDates("Jun 16 - Jul 16, 2026")).toEqual({
      startDate: "2026-06-16",
      endDate: "2026-07-16",
    });
  });

  it("inherits the month when the end date omits it", () => {
    expect(parseSubmissionDates("Apr 05 - 06, 2024")).toEqual({
      startDate: "2024-04-05",
      endDate: "2024-04-06",
    });
  });

  it("handles a single-day event", () => {
    expect(parseSubmissionDates("Aug 17, 2026")).toEqual({
      startDate: "2026-08-17",
      endDate: "2026-08-17",
    });
  });

  it("rolls the start back a year when the window crosses new year", () => {
    expect(parseSubmissionDates("Dec 28 - Jan 05, 2026")).toEqual({
      startDate: "2025-12-28",
      endDate: "2026-01-05",
    });
  });

  it("returns nulls rather than guessing when the string is unusable", () => {
    expect(parseSubmissionDates(null)).toEqual({ startDate: null, endDate: null });
    expect(parseSubmissionDates("coming soon")).toEqual({ startDate: null, endDate: null });
    expect(parseSubmissionDates("Smarch 40, 2026")).toEqual({ startDate: null, endDate: null });
  });
});

describe("parseHackathon", () => {
  const html = [
    '<div>"startDate": "2026-07-13T12:00:00.000-04:00"</div>',
    '<div>"endDate": "2026-07-21T21:00:00.000-04:00"</div>',
    '<a href="/participants">Participants (46,725)</a>',
    "<p>Online</p><p>$25,000 in prizes</p>",
  ].join("");

  it("extracts the dates the gallery does not carry", () => {
    const detail = parseHackathon(html);
    expect(detail.startDate).toBe("2026-07-13");
    expect(detail.endDate).toBe("2026-07-21");
    expect(detail.year).toBe(2026);
  });

  it("extracts participants, prize pool, and mode", () => {
    const detail = parseHackathon(html);
    expect(detail.participantCount).toBe(46725);
    expect(detail.prizePool).toBe(25000);
    expect(detail.currency).toBe("USD");
    expect(detail.mode).toBe("online");
  });

  it("returns nulls for a page with none of those facts", () => {
    const detail = parseHackathon("<html><body>nothing useful</body></html>");
    expect(detail.startDate).toBeNull();
    expect(detail.year).toBeNull();
    expect(detail.participantCount).toBeNull();
    expect(detail.prizePool).toBeNull();
  });
});
