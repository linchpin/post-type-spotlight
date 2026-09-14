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

# Strip the release-please marker lines from the packaged readme.
#
# Stays inline rather than calling linchpin/actions#178: this script has to
# run with no GitHub Actions at all - locally, and as plugin-check's
# build_command.
#
# Plugin Check and the WordPress.org readme parser both read the header block
# as contiguous lines and stop at the first line that is not a header. The
# markers sit between "Requires PHP" and "Stable tag", so everything below
# them - Stable tag, License, License URI - is invisible to the parser. That
# surfaced as the no_license and no_stable_tag errors. The deploy workflows
# strip them too; doing it here keeps the checked package identical to the
# shipped one.
sed -i.bak '/x-release-please-start-version/d;/x-release-please-end/d' "${OUTPUT_DIR}/readme.txt"
rm -f "${OUTPUT_DIR}/readme.txt.bak"

# Restore the dev toolchain for whoever runs this locally.
composer install --no-progress --quiet

echo "Built ${OUTPUT_DIR}"
