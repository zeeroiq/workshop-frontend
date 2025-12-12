#!/bin/bash

FILES_TO_FIX=$(find src -name "*.jsx" -print0 | xargs -0 grep -l -E "import.*from '.*'")

for file in $FILES_TO_FIX; do
  sed -i '' -E "s/(import.*from '.*\/)(.*)';/\1\2.jsx';/g" "$file"
done
