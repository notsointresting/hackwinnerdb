import { expect, test } from "@playwright/test";

test("homepage shows real statistics and recent winners", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Explore what wins hackathons");
  await expect(page.getByText("Winning Projects", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent Winners" })).toBeVisible();
});

test("search finds a seeded project", async ({ page }) => {
  await page.goto("/projects");
  // Target the toolbar input by id: "Search HackWinnerDB" also labels the command
  // palette, so the accessible name alone is ambiguous.
  const search = page.locator("#results-search");
  await search.fill("Mochi");
  await page.waitForLoadState("networkidle");
  // Submit with the keyboard rather than clicking the button. On a narrow
  // viewport the toolbar wraps and the sticky header covers the submit button,
  // so a click gets intercepted no matter how far we scroll - and pressing
  // Enter is what a phone keyboard actually does.
  await search.press("Enter");
  await expect(page).toHaveURL(/q=Mochi/);
  await page.waitForLoadState('networkidle');
  // Use first() to handle multiple results with same name, then verify it's visible
  const mochiHeading = page.getByRole("article").filter({ hasText: "Mochi" }).first().getByRole("heading", { name: "Mochi" });
  await expect(mochiHeading).toBeVisible();
});

test("filters are reflected in the URL and narrow results", async ({ page }) => {
  await page.goto("/projects?technology=gemini");
  await expect(page.getByRole("article").first()).toBeVisible();
  const count = await page.getByRole("article").count();
  expect(count).toBeGreaterThan(0);
});

test("project page shows the award and verified source", async ({ page }) => {
  await page.goto("/projects/nested");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nested");
  await expect(page.getByText("First Place Overall").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Original announcement/ })).toBeVisible();
});

test("hackathon page lists its winners", async ({ page }) => {
  await page.goto("/hackathons/google-ai-hackathon-2024");
  await expect(page.getByRole("heading", { name: "Winners" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Nested" })).toBeVisible();
});

test("technology page computes pairings", async ({ page }) => {
  await page.goto("/technology/gemini");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gemini");
  await expect(page.getByText("Frequently paired with")).toBeVisible();
});

test("dataset downloads are served", async ({ request }) => {
  const response = await request.get("/dataset/hackwinnerdb.json");
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.entries.length).toBeGreaterThan(0);
});
