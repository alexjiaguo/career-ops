import urllib.request
import json
import os
import re
from datetime import datetime

VAULT_PATH = '/Users/boss/Library/Mobile Documents/iCloud~md~obsidian/Documents/Life_OS/10_Projects/02_Job_Hunt_2026'
JD_POOL = os.path.join(VAULT_PATH, '10_JD_Pool')

ATS_TARGETS = [
    { 'name': 'Stripe', 'type': 'greenhouse', 'slug': 'stripe' },
    { 'name': 'Figma', 'type': 'greenhouse', 'slug': 'figma' },
    { 'name': 'Canva', 'type': 'greenhouse', 'slug': 'canva' }, # Try GH first
    { 'name': 'Discord', 'type': 'greenhouse', 'slug': 'discord' },
    { 'name': 'Airbnb', 'type': 'greenhouse', 'slug': 'airbnb' },
    { 'name': 'Pinterest', 'type': 'greenhouse', 'slug': 'pinterest' },
    { 'name': 'Reddit', 'type': 'greenhouse', 'slug': 'reddit' },
    { 'name': 'Riot Games', 'type': 'greenhouse', 'slug': 'riotgames' },
    { 'name': 'Epic Games', 'type': 'greenhouse', 'slug': 'epicgames' },
    { 'name': 'GitLab', 'type': 'greenhouse', 'slug': 'gitlab' },
    { 'name': 'Twitch', 'type': 'greenhouse', 'slug': 'twitch' },
    { 'name': 'The Trade Desk', 'type': 'greenhouse', 'slug': 'thetradedesk' },
    { 'name': 'Agoda', 'type': 'greenhouse', 'slug': 'agoda' },
    { 'name': 'Roblox', 'type': 'greenhouse', 'slug': 'roblox' },
    { 'name': 'Notion', 'type': 'lever', 'slug': 'notion' },
    { 'name': 'Shopee', 'type': 'lever', 'slug': 'shopee' }
]

TARGET_LOCATIONS = ['singapore', 'beijing', 'shanghai', 'hong kong', 'remote']

def strip_html(text):
    if not text: return ''
    text = re.sub(r'<[^>]*>?', '', text)
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&')
    text = re.sub(r'\n\s*\n', '\n\n', text)
    return text.strip()

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        return None

def save_to_vault(company, title, location, url, job_id, content):
    safe_title = title.replace('/', '-').replace(':', '')
    file_name = f"{safe_title} | {company} | ATS.md"
    file_path = os.path.join(JD_POOL, file_name)
    
    date_str = datetime.now().strftime('%Y-%m-%d')
    remote_flag = 'remote' if 'remote' in location.lower() else 'hybrid'
    
    markdown = f"""---
title: "{safe_title} | {company} | ATS"
source: "{url}"
created: {date_str}
tags:
  - jobs
  - ats-scanned
status: new
Tier: ""
score: ""
company: "{company}"
location: "{location}"
remote: "{remote_flag}"
archetype: ""
pdf_generated: false
description: "Automatically extracted via ATS API proxy."
_ats_id: "{job_id}"
---

## {title}

**Location:** {location}
**Company:** {company}
**ATS JD ID:** `{job_id}`

### Job Description
{content}
"""
    try:
        with open(file_path, 'w') as f:
            f.write(markdown)
        print(f"  -> Saved: {file_name}")
    except Exception as e:
        print(f"Failed to save {file_name}: {e}")

def process_greenhouse(company):
    url = f"https://boards-api.greenhouse.io/v1/boards/{company['slug']}/jobs?content=true"
    print(f"[{company['name']}] Scanning Greenhouse API...")
    data = fetch_json(url)
    if not data or 'jobs' not in data: return
    
    for job in data['jobs']:
        title = job.get('title', '').lower()
        loc = job.get('location', {}).get('name', '').lower()
        
        if ('product manager' in title or 'product leader' in title) and 'engineering' not in title:
            if any(tl in loc for tl in TARGET_LOCATIONS) or 'china' in loc or 'apac' in loc:
                content = strip_html(job.get('content', ''))
                save_to_vault(company['name'], job['title'], job['location']['name'], job['absolute_url'], job.get('id', ''), content)

def process_lever(company):
    url = f"https://api.lever.co/v0/postings/{company['slug']}?mode=json"
    print(f"[{company['name']}] Scanning Lever API...")
    data = fetch_json(url)
    if not data: return
    
    for job in data:
        title = job.get('text', '').lower()
        loc = job.get('categories', {}).get('location', '').lower()
        
        if ('product manager' in title or 'product leader' in title):
            if any(tl in loc for tl in TARGET_LOCATIONS) or 'china' in loc or 'apac' in loc:
                content = strip_html(job.get('description', '') or job.get('descriptionPlain', ''))
                save_to_vault(company['name'], job['text'], loc, job.get('hostedUrl', ''), job.get('id', ''), content)

def main():
    print(f"Starting ATS Scanner... Mapping {len(ATS_TARGETS)} Companies")
    os.makedirs(JD_POOL, exist_ok=True)
    
    for company in ATS_TARGETS:
        if company['type'] == 'greenhouse':
            process_greenhouse(company)
        elif company['type'] == 'lever':
            process_lever(company)
    print("ATS Scanning Complete.")

if __name__ == "__main__":
    main()
