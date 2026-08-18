import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

/** Recursively collect every .yaml/.yml file under `dir`. */
export function listYamlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listYamlFiles(full));
    else if (/\.ya?ml$/.test(entry.name)) out.push(full);
  }
  return out.sort();
}

export function readYaml<T = unknown>(file: string): T {
  return parse(fs.readFileSync(file, "utf8")) as T;
}

/** Read every YAML doc in a directory, keeping the source path for error messages. */
export function readYamlDir(dir: string): { file: string; data: unknown }[] {
  return listYamlFiles(dir).map((file) => ({ file, data: readYaml(file) }));
}
