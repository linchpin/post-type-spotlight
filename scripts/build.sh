#!/bin/bash
#
# Build the distributable plugin directory at build/post-type-spotlight.
#
# Used locally and by plugin-check.yml, which defaults `build_command` to this
# script and then points Plugin Check at `build_dir`. Assumes `npm run build`
# has already produced blocks/build.

set -euo pipefail

SLUG="post-type-spotlight"
OUTPUT_DIR="build/${SLUG}"

echo "Building ${SLUG}..."

rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"

# Production dependencies only. composer/installers is the sole runtime
# requirement, so this stays small, but --no-dev keeps the standards toolchain
# out of the artifact.
composer install --no-dev --optimize-autoloader --prefer-dist --no-progress --quiet

# .distignore is the single exclusion list. rsync reads it directly so the zip
# and this directory can never disagree about what ships.
rsync -a --exclude-from=".distignore" ./ "${OUTPUT_DIR}/"

# Restore the dev toolchain for whoever runs this locally.
composer install --no-progress --quiet

echo "Built ${OUTPUT_DIR}"
