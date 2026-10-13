#!/usr/bin/env bash
# Copies documents/wiki/* (pages + images) into the GitHub WIKI in one go.
# One-time setup: on GitHub open the Wiki tab and click "Create the first page" (any text), so the wiki repo exists.
# Usage from the repo folder:  bash scripts/publish_wiki.sh
set -e
REPO=$(git config --get remote.origin.url | sed -E 's#(\.git)?$##')
TMP=$(mktemp -d)
git clone "$REPO.wiki.git" "$TMP/wiki"
cp -R documents/wiki/. "$TMP/wiki/"
cd "$TMP/wiki"
git add -A
git commit -m "Update WIKI pages from documents/wiki" || echo "Nothing new to publish"
git push
echo "WIKI updated. Edit pages on GitHub as you go; re-running this script overwrites them with documents/wiki."
