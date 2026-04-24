#!/bin/bash

# Agent-Scanner: Trigger for Antigravity-led job discovery
# This script serves as a manifest and trigger for the agent to perform
# automated job discovery, bypassing local network restrictions.

echo "---"
echo "Job Discovery Scan Initiated: $(date)"
echo "Targeting Tier-1 Companies: DeepSeek, OpenAI, ByteDance, Shopee, Moonshot, Zhipu, MiniMax"
echo "---"

# Usage: antigravity execute scan --targets=tier-1
# Logic:
# 1. Agent uses browser_subagent to scan target career portals.
# 2. Identified JDs are saved to 10_JD_Pool/ with 'status: new'.
# 3. Agent notifies user of new leads.

echo "Scan complete. Check 10_JD_Pool/ for updates."
