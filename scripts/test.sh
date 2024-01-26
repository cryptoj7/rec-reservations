#!/bin/sh

if command -v pushd >/dev/null; then
    pushd "$(dirname "$0")" >/dev/null
    # Your script operations...
    popd >/dev/null
else
    original_dir=$(pwd)
    cd "$(dirname "$0")"
    # Your script operations...
    cd "$original_dir"
fi

rm ../prisma/test.db >/dev/null 2>/dev/null
DATABASE_URL=file:test.db npx prisma db push >/dev/null

npx tsc --build

npx mocha dist/**/*.test.js

rm ./prisma/*.test.db