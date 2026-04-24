#!/usr/bin/env node
/**
 * LinkedIn Jobs Scanner — Node.js wrapper for linkedin-jobs-api.
 *
 * Scrapes LinkedIn public job listings. No API key needed.
 * Outputs JSON to stdout matching the same schema as jobspy-scan.py.
 *
 * Usage:
 *   node linkedin-scan.mjs --keyword "AI product manager" --location "Singapore" --limit 25
 *   node linkedin-scan.mjs --keyword "产品经理" --location "Beijing" --limit 10 --date "past week"
 *
 * All filters:
 *   --keyword       Search keyword (required)
 *   --location      Location filter (required)
 *   --limit         Max results (default: 25)
 *   --date          Date posted: "past month", "past week", "24hr" (default: "past week")
 *   --job-type      Job type: "full time", "part time", "contract", "internship"
 *   --remote        Remote filter: "remote", "on site", "hybrid"
 *   --experience    Experience: "entry level", "associate", "senior", "director", "executive"
 *   --sort          Sort by: "recent", "relevant" (default: "recent")
 *   --page          Page number, 0-indexed (default: "0")
 */

import { parseArgs } from "node:util";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const linkedIn = require("linkedin-jobs-api");

const { values: args } = parseArgs({
  options: {
    keyword: { type: "string", short: "k" },
    location: { type: "string", short: "l" },
    limit: { type: "string", short: "n", default: "25" },
    date: { type: "string", short: "d", default: "past week" },
    "job-type": { type: "string", default: "full time" },
    remote: { type: "string", default: "" },
    experience: { type: "string", default: "" },
    sort: { type: "string", default: "recent" },
    page: { type: "string", default: "0" },
    help: { type: "boolean", short: "h", default: false },
  },
  strict: true,
});

if (args.help || !args.keyword || !args.location) {
  console.error(`Usage: node linkedin-scan.mjs --keyword "AI product manager" --location "Singapore" [options]

Options:
  --keyword, -k     Search keyword (required)
  --location, -l    Location filter (required)
  --limit, -n       Max results (default: 25)
  --date, -d        "past month", "past week", "24hr" (default: "past week")
  --job-type        "full time", "part time", "contract", "internship"
  --remote          "remote", "on site", "hybrid"
  --experience      "entry level", "associate", "senior", "director", "executive"
  --sort            "recent" or "relevant" (default: "recent")
  --page            Page number, 0-indexed (default: "0")
  --help, -h        Show this help`);
  process.exit(args.help ? 0 : 1);
}

const queryOptions = {
  keyword: args.keyword,
  location: args.location,
  dateSincePosted: args.date,
  jobType: args["job-type"],
  limit: args.limit,
  sortBy: args.sort,
  page: args.page,
};

// Only add optional filters if specified
if (args.remote) queryOptions.remoteFilter = args.remote;
if (args.experience) queryOptions.experienceLevel = args.experience;

console.error(
  `[linkedin-scan] Searching: "${args.keyword}" in ${args.location} (${args.date}, limit ${args.limit})...`
);

try {
  const results = await linkedIn.query(queryOptions);

  // Normalize output to match jobspy-scan.py schema
  const normalized = results.map((job) => ({
    title: job.position || "",
    company: job.company || "",
    company_url: "",
    job_url: job.jobUrl || "",
    location: job.location || args.location,
    city: "",
    state: "",
    country: "",
    is_remote: (args.remote || "").toLowerCase() === "remote",
    description: "",
    job_type: args["job-type"] || "",
    date_posted: job.date || "",
    site: "linkedin",
    min_amount: null,
    max_amount: null,
    currency: "",
    interval: "",
    job_level: args.experience || "",
    company_industry: "",
    company_logo: job.companyLogo || "",
    ago_time: job.agoTime || "",
    salary: job.salary || "",
    emails: "",
    tags: ["careerops"],
  }));

  // Deduplicate by job_url
  const seen = new Set();
  const unique = normalized.filter((j) => {
    if (!j.job_url || seen.has(j.job_url)) return false;
    seen.add(j.job_url);
    return true;
  });

  console.error(`[linkedin-scan] Found ${unique.length} unique jobs`);
  console.log(JSON.stringify(unique, null, 2));
} catch (err) {
  console.error(`[linkedin-scan] Error: ${err.message}`);
  // Output empty array on error so the agent can still continue
  console.log("[]");
  process.exit(1);
}
