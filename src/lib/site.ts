export const SITE = {
  name: "HackWinnerDB",
  tagline: "The open-source database of hackathon winners.",
  headline: "Explore what wins hackathons.",
  description:
    "Discover winning hackathon projects by technology, category, year, event, award, and source — powered by the open-source community.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://hackwinnerdb.netlify.app",
  repo: "https://github.com/notsointresting/hackwinnerdb",
} as const;

export const PER_PAGE = 24;
