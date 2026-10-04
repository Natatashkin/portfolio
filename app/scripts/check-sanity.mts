// Checks the Sanity connection. Prints only OK / FAIL per check, never values.
// Run from app/: node --env-file-if-exists=.env.local scripts/check-sanity.mts

import { DEFAULT_API_VERSION } from "../src/lib/sanity/apiVersion.ts";

type Check = { name: string; ok: boolean; required: boolean; note?: string };

const checks: Check[] = [];

function check(
  name: string,
  ok: boolean,
  options: { required?: boolean; note?: string } = {},
): boolean {
  checks.push({ name, ok, required: options.required ?? true, note: options.note });
  return ok;
}

function read(name: string): string | undefined {
  const value = process.env[name];
  return value === undefined || value === "" ? undefined : value;
}

const projectId = read("NEXT_PUBLIC_SANITY_PROJECT_ID");
const dataset = read("NEXT_PUBLIC_SANITY_DATASET");
const apiVersion = read("NEXT_PUBLIC_SANITY_API_VERSION") ?? DEFAULT_API_VERSION;
const token = read("SANITY_API_READ_TOKEN");

check("env: NEXT_PUBLIC_SANITY_PROJECT_ID present", projectId !== undefined);
check("env: NEXT_PUBLIC_SANITY_DATASET present", dataset !== undefined);
check("env: NEXT_PUBLIC_SANITY_API_VERSION present", read("NEXT_PUBLIC_SANITY_API_VERSION") !== undefined, {
  required: false,
  note: "client falls back to a pinned date",
});
check("env: SANITY_API_READ_TOKEN present", token !== undefined, {
  required: false,
  note: "needed for draft preview",
});
check("env: SANITY_REVALIDATE_SECRET present", read("SANITY_REVALIDATE_SECRET") !== undefined, {
  required: false,
  note: "needed for the webhook route",
});
check("env: NEXT_PUBLIC_SITE_URL present", read("NEXT_PUBLIC_SITE_URL") !== undefined, {
  required: false,
  note: "needed for metadata and hreflang",
});

const formatsValid = [
  check(
    "format: project ID (lowercase letters and digits only)",
    projectId !== undefined && /^[a-z0-9]+$/.test(projectId),
  ),
  check("format: dataset name", dataset !== undefined && /^[a-z0-9][a-z0-9_-]{0,63}$/.test(dataset)),
  check("format: API version (YYYY-MM-DD)", /^\d{4}-\d{2}-\d{2}$/.test(apiVersion)),
].every(Boolean);

function query(groq: string, auth?: { token: string; perspective: string }) {
  const params = new URLSearchParams({ query: groq });
  if (auth) params.set("perspective", auth.perspective);
  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?${params}`;
  return fetch(url, auth ? { headers: { Authorization: `Bearer ${auth.token}` } } : undefined);
}

const QUERY_CHECK = "query: anonymous test query against the dataset";
const TOKEN_CHECK = "token: read token accepted (drafts perspective)";

if (!formatsValid) {
  check(QUERY_CHECK, false, { note: "skipped, fix the format checks first" });
  check(TOKEN_CHECK, false, { required: false, note: "skipped, fix the format checks first" });
} else {
  try {
    const response = await query("count(*)");
    const body: unknown = response.ok ? await response.json() : undefined;
    const hasResult =
      typeof body === "object" && body !== null && "result" in body && typeof body.result === "number";
    check(QUERY_CHECK, hasResult, { note: response.ok ? "unexpected response" : `HTTP ${response.status}` });
  } catch {
    // Never log the error: it may contain the request URL.
    check(QUERY_CHECK, false, { note: "network error" });
  }

  if (token === undefined) {
    check(TOKEN_CHECK, false, { required: false, note: "token not set, skipped" });
  } else {
    try {
      // The drafts perspective only works for authenticated requests with read access.
      const response = await query("count(*)", { token, perspective: "drafts" });
      check(TOKEN_CHECK, response.ok, { required: false, note: `HTTP ${response.status}` });
    } catch {
      // Never log the error: it may contain the request URL.
      check(TOKEN_CHECK, false, { required: false, note: "network error" });
    }
  }
}

for (const { name, ok, required, note } of checks) {
  const optional = required ? "" : " [optional for now]";
  console.log(`${ok ? "OK  " : "FAIL"}  ${name}${optional}${!ok && note ? ` (${note})` : ""}`);
}

process.exitCode = checks.every(({ ok, required }) => ok || !required) ? 0 : 1;
