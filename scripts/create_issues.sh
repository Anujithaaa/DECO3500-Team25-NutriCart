#!/usr/bin/env bash
# Creates labels, milestones and all issues in the current GitHub repo using the GitHub CLI.
# Usage (from the repo folder, after `gh auth login`):  bash scripts/create_issues.sh
# Then: Projects tab → New project (Board) → Add items → add all open issues.
set -e
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Creating in $REPO"
gh label create documentation --force >/dev/null
gh label create evaluation --force >/dev/null
gh label create physical --force >/dev/null
gh label create poster --force >/dev/null
gh label create process --force >/dev/null
gh label create prototype --force >/dev/null
gh label create setup --force >/dev/null
gh label create submission --force >/dev/null
gh api repos/$REPO/milestones -f title=Submission >/dev/null 2>&1 || true
gh api repos/$REPO/milestones -f title=Tradeshow >/dev/null 2>&1 || true
gh issue create --title 'Make repo public, add deco3500-team as collaborator, enable WIKI' --label setup --milestone Tradeshow --body '**Owner:** Anujitha  
**Due:** Tue 13 Oct

- [ ] Settings → General → visibility Public
- [ ] Settings → Collaborators → add `deco3500-team`
- [ ] Settings → Features → Wikis on
- [ ] Post the repo URL in team chat'
gh issue create --title 'Push the cleaned repo (force push) and ask everyone to re-clone' --label prototype --milestone Tradeshow --body '**Owner:** Anujitha  
**Due:** Tue 13 Oct

After the history clean-up: force push, make the repo public again, everyone deletes old clones and re-clones.'
gh issue create --title 'Team call: lock domain statement, G1–G6 must-haves, hosting, session schedule' --label process --milestone Tradeshow --body '**Owner:** Aman  
**Due:** Wed 14 Oct

Decisions to record in Stand-up Records:
- [ ] Final domain statement (v4 or edit)
- [ ] G1–G6: which are must-have for the tradeshow
- [ ] Hosting: Render vs laptop + hotspot
- [ ] Who runs which evaluation session
- [ ] Confirm owners on this board'
gh issue create --title 'Set up GitHub Projects board and add every issue' --label process --milestone Tradeshow --body '**Owner:** Aman  
**Due:** Wed 14 Oct

Board columns: Todo / In progress / Done. Add all issues; set owner and due date fields.'
gh issue create --title 'Paste WIKI pages from documents/wiki and resolve every [confirm]' --label documentation --milestone Tradeshow --body '**Owner:** Kenan  
**Due:** Wed 14 Oct

Pages: Home, Week 9 Stand-up, Stand-up Records, User Research, Evaluation Plan, Ethical Considerations, Design Process Overview. Upload documents/wiki/images. Search each page for `[confirm` and fix.'
gh issue create --title 'Week 9 Stand-up page: confirm stand-up date and team notes' --label documentation --milestone Tradeshow --body '**Owner:** Aman  
**Due:** Wed 14 Oct

Keep the honest '"'"'written up after the event'"'"' note.'
gh issue create --title 'Run v0.3 on a laptop + 2 phones (README demo) and log any bugs' --label prototype --milestone Tradeshow --body '**Owner:** Anujitha  
**Due:** Wed 14 Oct

Follow README → Run it on a laptop. Walk through G1–G6 with two Cart Units. Open an issue per bug.'
gh issue create --title 'Expo Cart Unit: test in Expo Go on iPhone and Android' --label prototype --milestone Tradeshow --body '**Owner:** James  
**Due:** Wed 14 Oct

`npx expo install --fix` if the SDK doesn'"'"'t match Expo Go. Test camera scan → compare, Ask home, Split Shop, Finish.'
gh issue create --title 'Host the backend and test on uni Wi-Fi and a phone hotspot' --label prototype --milestone Tradeshow --body '**Owner:** Anujitha  
**Due:** Thu 15 Oct

render.yaml is in the repo (New → Blueprint). Paste the hosted /dock link into README. Test from 3 devices on uni Wi-Fi.'
gh issue create --title 'Pre-load 20–40 real products with shelf prices (one store)' --label prototype --milestone Tradeshow --body '**Owner:** James  
**Due:** Thu 15 Oct

Use Dock → Product library. Barcode, name, size, compare category, shelf price, unit price, protein, sugar. Record the store and date observed.'
gh issue create --title 'Build the physical Home Dock stand + 4 numbered housemate tokens' --label physical --milestone Tradeshow --body '**Owner:** James  
**Due:** Fri 16 Oct

Tablet or laptop in a kitchen-style stand. Coloured, numbered tokens (1–4) matching the screen. Photograph for the WIKI and poster.'
gh issue create --title 'Build the Cart Unit mount for basket AND trolley handles' --label physical --milestone Tradeshow --body '**Owner:** James  
**Due:** Fri 16 Oct

Must fit a basket handle (basket shoppers found v2 too big). Photograph it in use.'
gh issue create --title 'Optional: make tokens physical with a keypad or Makey Makey (keys 1–4)' --label physical --milestone Tradeshow --body '**Owner:** James  
**Due:** Sat 17 Oct

The Dock already selects a token when keys 1–4 are pressed.'
gh issue create --title 'Recruit 2–3 share houses and 2 shopping pairs; book times' --label evaluation --milestone Tradeshow --body '**Owner:** Aman  
**Due:** Wed 14 Oct

Sessions Thu 15–Sat 17. Every member leads or co-runs at least one.'
gh issue create --title 'Run household sessions H1–H3 (Evaluation Plan, Study A)' --label evaluation --milestone Tradeshow --body '**Owner:** All  
**Due:** Sat 17 Oct

Reset the house first. Observation sheet + counts + group interview. Add participants to the evidence register within 24 h.'
gh issue create --title 'Run shop-pair sessions S1–S2 (store with permission, or simulated $25 shop)' --label evaluation --milestone Tradeshow --body '**Owner:** All  
**Due:** Sat 17 Oct

Study B script.'
gh issue create --title 'Evidence register with participant IDs; fix all participant counts' --label documentation --milestone Tradeshow --body '**Owner:** Kenan  
**Due:** Sat 17 Oct

One ID per participant (R1-P01…, R2-, R3-, SH-, H1-P1, S1-P1). Poster and overview numbers come only from here. Label studio peers separately.'
gh issue create --title 'Synthesise R4 findings (Q1–Q8) → list of v4 changes' --label evaluation --milestone Tradeshow --body '**Owner:** Kenan  
**Due:** Sun 18 Oct

Fill Evaluation Plan → Results.'
gh issue create --title 'v4 fixes from evaluation' --label prototype --milestone Tradeshow --body '**Owner:** Anujitha  
**Due:** Mon 19 Oct

Only fixes the evidence supports. Note each change and its evidence.'
gh issue create --title 'Poster content and A2 portrait layout' --label poster --milestone Tradeshow --body '**Owner:** James  
**Due:** Thu 15 Oct

Use documents/promo/poster-content-draft.md. Close-read, conference style, QR code to the repo.'
gh issue create --title 'Send poster to print (A2 portrait)' --label poster --milestone Tradeshow --body '**Owner:** James  
**Due:** Fri 16 Oct

Check print-shop lead time first. If evaluation results aren'"'"'t ready, print with prototype + research and present R4 results verbally.'
gh issue create --title 'Pitch script; every member can deliver it (≈2.5 min)' --label poster --milestone Tradeshow --body '**Owner:** Aman  
**Due:** Mon 19 Oct

Use documents/promo/pitch-script.md. Each member rehearses the whole pitch once.'
gh issue create --title 'Tradeshow rehearsal with the real setup' --label process --milestone Tradeshow --body '**Owner:** All  
**Due:** Mon 19 Oct

Dock on a table, 2 Cart Units, hotspot, poster. Reset between visitors. Spare chargers.'
gh issue create --title 'Optional promo video (60 s) of a household using the Hub' --label poster --milestone Submission --body '**Owner:** James  
**Due:** Fri 23 Oct

Link from README.'
gh issue create --title 'Ethical Considerations: update with R4 and tradeshow evidence' --label documentation --milestone Submission --body '**Owner:** Aman  
**Due:** Fri 23 Oct

E1, E3, E4, E5 and the revision log.'
gh issue create --title 'Design Process Overview: add R4, tradeshow, images, who did what' --label documentation --milestone Submission --body '**Owner:** Kenan  
**Due:** Sat 24 Oct

Keep around 1,000 words plus images. Link poster and prototype at the top.'
gh issue create --title 'Full citations for every paper we used' --label documentation --milestone Submission --body '**Owner:** Kenan  
**Due:** Fri 23 Oct

Including the 8 papers from the literature review.'
gh issue create --title 'AI use statement (README + overview)' --label documentation --milestone Submission --body '**Owner:** All  
**Due:** Sun 25 Oct

Per course policy: tools, which parts, how checked.'
gh issue create --title 'Export Design Process Overview + Ethical Considerations as TeamName_3DesignPrototype.pdf and submit the repo URL' --label submission --milestone Submission --body '**Owner:** Kenan  
**Due:** Mon 26 Oct 3pm

Aman is backup. Submit by 12pm to leave a buffer. Check the WIKI is visible to staff.'
gh issue create --title 'Cost split: softer wording + a '"'"'don'"'"'t split'"'"' option (Ethics E1)' --label prototype --milestone Submission --body '**Owner:** Anujitha  
**Due:** after R4

Only if R4 shows the split feels awkward.'
echo "Done: 30 issues."
