#! /usr/bin/env zsh


# create dist
rm -rf dist || echo 'dist/ not present, creating...'
mkdir dist

# bundle to tmpfiles
/home/rg/.deno/bin/deno bundle cli/diatom-export.ts dist/diatom-export.tmp
/home/rg/.deno/bin/deno bundle cli/diatom-open.ts   dist/diatom-open.tmp
/home/rg/.deno/bin/deno bundle cli/diatom-list.ts   dist/diatom-list.tmp
/home/rg/.deno/bin/deno bundle cli/diatom.ts        dist/diatom.tmp

# create shebangs
echo '#!/bin/sh'                                                 | tee -a dist/shebang.tmp
echo '//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"' | tee -a dist/shebang.tmp

# combine shebang and bundles
cat dist/shebang.tmp dist/diatom-export.tmp >> dist/diatom-export
cat dist/shebang.tmp dist/diatom-open.tmp   >> dist/diatom-open
cat dist/shebang.tmp dist/diatom-list.tmp   >> dist/diatom-list
cat dist/shebang.tmp dist/diatom.tmp        >> dist/diatom

# remove tempfiles
rm dist/*.tmp


# chmod
chmod +x dist/diatom-export
chmod +x dist/diatom-open
chmod +x dist/diatom-list
chmod +x dist/diatom

echo '🔶 diatom bundled.'
