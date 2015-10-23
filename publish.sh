#!/bin/bash
set -e
cp -r dist .git
git checkout gh_pages
cp -r .git/dist/* .
gc -m "Autocommit $(date +%Y-%m-%d:%H:%M:%S)"
git checkout master
