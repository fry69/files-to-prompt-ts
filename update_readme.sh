#!/usr/bin/env bash

# Read version string from commandline, from running the script or set it to '[unknown]'
if [[ -n $1 ]]; then
    version=$1
elif [[ -x ./files-to-prompt.ts ]]; then
    version=$(./files-to-prompt.ts --version 2>&1 | cut -d' ' -f 2)
else
    version="[unknown]"
fi

test_output=$(bun test --coverage 2>&1)

# Find the start and end of the existing test section
start_line=$(grep -n "## Test status and Coverage" README.md | cut -d':' -f1)
end_line=$(grep -n "## Compatibility" README.md | cut -d':' -f1)

# Create a new README.md file with the updated test section
{
    head -n $((start_line-1)) README.md
    echo "## Test status and Coverage"
    echo
    echo "Recent test status (${version}, using nbconvert-shim):"
    echo
    echo "\`\`\`"
    echo "$test_output"
    echo "\`\`\`"
    echo
    tail -n +"$end_line" README.md
 } >> temp.md

# Replace the current README.md file
mv temp.md README.md