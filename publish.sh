#!/bin/bash
set -e
cp -r dist .git
git checkout gh-pages
cp -r .git/dist/* .
git add -A
git commit -m "Autocommit $(date +%Y-%m-%d:%H:%M:%S)"
git checkout master
