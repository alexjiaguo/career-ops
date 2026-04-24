#!/usr/bin/env python3
"""
JobSpy Scanner — Structured job board scraper for Career-Ops.

Scrapes LinkedIn, Indeed, Glassdoor, Google Jobs (no API keys needed).
Outputs JSON to stdout for the AI agent to parse and map to JD files.

Usage:
    # Direct query
    python3 jobspy-scan.py --search-term "AI product manager" --location "Singapore" --results 50

    # Config-driven (reads config.yml roles × locations)
    python3 jobspy-scan.py --config /path/to/config.yml

    # Specific sites only
    python3 jobspy-scan.py --search-term "product manager" --location "Beijing" --sites linkedin,google

Requirements:
    pip install python-jobspy
"""

import argparse
import json
import sys
import warnings
from pathlib import Path

# Suppress noisy warnings from dependencies
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", category=UserWarning)


def parse_config(config_path: str) -> list[dict]:
    """Read config.yml and generate search queries from roles × locations."""
    try:
        import yaml
    except ImportError:
        # PyYAML not available — fall back to basic parsing
        print(
            json.dumps({"error": "PyYAML not installed. Use --search-term and --location instead."}),
            file=sys.stderr,
        )
        return []

    with open(config_path) as f:
        config = yaml.safe_load(f)

    queries = []
    roles = config.get("targeting", {}).get("roles", [])
    locations = config.get("targeting", {}).get("locations", [])
    jobspy_config = config.get("jobspy", {})

    for role in roles:
        for loc_group in locations:
            for city in loc_group.get("cities", []):
                queries.append({
                    "search_term": role,
                    "location": city,
                    "sites": jobspy_config.get("sites", ["linkedin", "indeed", "google"]),
                    "results": jobspy_config.get("results_per_query", 50),
                    "hours_old": jobspy_config.get("hours_old", 168),
                    "linkedin_fetch_description": jobspy_config.get("linkedin_fetch_description", False),
                    "country_indeed": jobspy_config.get("country_indeed", ""),
                })

    return queries


def run_search(
    search_term: str,
    location: str,
    sites: list[str],
    results: int = 50,
    hours_old: int = 168,
    linkedin_fetch_description: bool = False,
    country_indeed: str = "",
    google_search_term: str = "",
) -> list[dict]:
    """Run a single JobSpy search and return structured results."""
    try:
        from jobspy import scrape_jobs
    except ImportError:
        print(
            json.dumps({"error": "python-jobspy not installed. Run: pip install python-jobspy"}),
            file=sys.stderr,
        )
        sys.exit(1)

    kwargs = {
        "site_name": sites,
        "search_term": search_term,
        "location": location,
        "results_wanted": results,
        "hours_old": hours_old,
        "linkedin_fetch_description": linkedin_fetch_description,
        "description_format": "markdown",
        "verbose": 0,
    }

    if country_indeed:
        kwargs["country_indeed"] = country_indeed

    if google_search_term:
        kwargs["google_search_term"] = google_search_term
    else:
        # Auto-generate a useful Google search term
        kwargs["google_search_term"] = f"{search_term} jobs near {location}"

    try:
        jobs_df = scrape_jobs(**kwargs)
    except Exception as e:
        print(json.dumps({"error": str(e), "query": search_term, "location": location}), file=sys.stderr)
        return []

    if jobs_df is None or jobs_df.empty:
        return []

    # Convert DataFrame to list of dicts with our schema
    results_list = []
    for _, row in jobs_df.iterrows():
        job = {
            "title": _safe_str(row.get("title")),
            "company": _safe_str(row.get("company")),
            "company_url": _safe_str(row.get("company_url")),
            "job_url": _safe_str(row.get("job_url")),
            "location": _build_location_string(row),
            "city": _safe_str(row.get("city")),
            "state": _safe_str(row.get("state")),
            "country": _safe_str(row.get("country")),
            "is_remote": bool(row.get("is_remote", False)),
            "description": _safe_str(row.get("description")),
            "job_type": _safe_str(row.get("job_type")),
            "date_posted": _safe_str(row.get("date_posted")),
            "site": _safe_str(row.get("site")),
            "min_amount": _safe_num(row.get("min_amount")),
            "max_amount": _safe_num(row.get("max_amount")),
            "currency": _safe_str(row.get("currency")),
            "interval": _safe_str(row.get("interval")),
            "job_level": _safe_str(row.get("job_level")),
            "company_industry": _safe_str(row.get("company_industry")),
            "emails": _safe_str(row.get("emails")),
            "tags": ["careerops"],
        }
        results_list.append(job)

    return results_list


def _safe_str(val) -> str:
    """Convert a value to string, handling NaN/None."""
    if val is None:
        return ""
    try:
        import pandas as pd
        if pd.isna(val):
            return ""
    except (ImportError, TypeError, ValueError):
        pass
    return str(val).strip()


def _safe_num(val):
    """Convert to number or None."""
    if val is None:
        return None
    try:
        import pandas as pd
        if pd.isna(val):
            return None
    except (ImportError, TypeError, ValueError):
        pass
    try:
        return float(val)
    except (TypeError, ValueError):
        return None


def _build_location_string(row) -> str:
    """Build a 'City, Country' location string from row data."""
    parts = []
    city = _safe_str(row.get("city"))
    state = _safe_str(row.get("state"))
    country = _safe_str(row.get("country"))
    if city:
        parts.append(city)
    if state:
        parts.append(state)
    if country:
        parts.append(country)
    return ", ".join(parts) if parts else _safe_str(row.get("location", ""))


def main():
    parser = argparse.ArgumentParser(description="JobSpy Scanner for Career-Ops")
    parser.add_argument("--search-term", "-s", help="Job title to search for")
    parser.add_argument("--location", "-l", help="Location to search in")
    parser.add_argument(
        "--sites",
        default="linkedin,indeed,google",
        help="Comma-separated list of sites: linkedin,indeed,glassdoor,google,zip_recruiter (default: linkedin,indeed,google)",
    )
    parser.add_argument("--results", "-n", type=int, default=50, help="Number of results per site (default: 50)")
    parser.add_argument("--hours-old", type=int, default=168, help="Max age of listings in hours (default: 168 = 1 week)")
    parser.add_argument("--linkedin-fetch-description", action="store_true", help="Fetch full description from LinkedIn (slower)")
    parser.add_argument("--country-indeed", default="", help="Country for Indeed/Glassdoor (e.g., 'Singapore', 'USA')")
    parser.add_argument("--google-search-term", default="", help="Custom Google Jobs search term")
    parser.add_argument("--config", help="Path to config.yml for auto-generated queries from roles × locations")

    args = parser.parse_args()

    all_results = []

    if args.config:
        # Config-driven mode: generate queries from roles × locations
        queries = parse_config(args.config)
        if not queries:
            print(json.dumps([]))
            sys.exit(0)

        total = len(queries)
        for i, q in enumerate(queries, 1):
            print(f"[{i}/{total}] Scanning: {q['search_term']} in {q['location']}...", file=sys.stderr)
            results = run_search(
                search_term=q["search_term"],
                location=q["location"],
                sites=q["sites"],
                results=q["results"],
                hours_old=q["hours_old"],
                linkedin_fetch_description=q["linkedin_fetch_description"],
                country_indeed=q["country_indeed"],
            )
            all_results.extend(results)
            print(f"    → Found {len(results)} jobs", file=sys.stderr)

    elif args.search_term and args.location:
        # Direct query mode
        sites = [s.strip() for s in args.sites.split(",")]
        all_results = run_search(
            search_term=args.search_term,
            location=args.location,
            sites=sites,
            results=args.results,
            hours_old=args.hours_old,
            linkedin_fetch_description=args.linkedin_fetch_description,
            country_indeed=args.country_indeed,
            google_search_term=args.google_search_term,
        )
    else:
        parser.error("Either --config or both --search-term and --location are required")

    # Deduplicate by job_url
    seen_urls = set()
    unique_results = []
    for job in all_results:
        url = job.get("job_url", "")
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_results.append(job)

    print(f"\nTotal unique jobs found: {len(unique_results)}", file=sys.stderr)
    print(json.dumps(unique_results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
