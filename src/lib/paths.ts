import path from "node:path";

export const ROOT = process.cwd();
export const DATA_DIR = path.join(ROOT, "data");
export const HACKATHONS_DIR = path.join(DATA_DIR, "hackathons");
export const PROJECTS_DIR = path.join(DATA_DIR, "projects");
export const ENTRIES_DIR = path.join(DATA_DIR, "entries");
export const TAXONOMIES_DIR = path.join(DATA_DIR, "taxonomies");
export const SOURCES_FILE = path.join(DATA_DIR, "sources.yaml");
export const DATASET_DIR = path.join(ROOT, "public", "dataset");

export const GITHUB_REPO = "https://github.com/notsointresting/hackwinnerdb";
export const GITHUB_EDIT_BASE = `${GITHUB_REPO}/edit/main`;
export const GITHUB_NEW_ISSUE = `${GITHUB_REPO}/issues/new`;
