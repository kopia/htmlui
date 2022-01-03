#!/bin/bash
set -e

tmpdir=$(mktemp -d)
git clone https://$GITHUB_TOKEN@github.com/kopia/htmluibuild $tmpdir
rm -rf $tmpdir/build
cp -rv build $tmpdir

echo Changes
(cd $tmpdir && git diff)

if [ "$GITHUB_TOKEN" == "" ]; then
  echo GITHUB_TOKEN not set, not pushing the build.
  exit 0
fi

(cd $tmpdir && git add -A && git -c "user.name=Kopia Builder" -c "user.email=builder@kopia.io" commit -m "HTMLUI update for $GITHUB_SERVER_URL/$GITHUB_REPOSITORY/commit/$GITHUB_SHA" && git push)