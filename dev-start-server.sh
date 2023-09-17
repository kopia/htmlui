#! /bin/bash
(
  cd ../kopia
  # start kopia server with default repo:
  #go run . server start --insecure --without-password --disable-csrf-token-checks --log-level=debug

  # for development you might want to use another repository for testing only, not your normal one, so you could use, e.g.
  go run . server start --insecure --without-password --disable-csrf-token-checks --log-level=debug  --config-file=$HOME/.config/kopia/disabled/repository-dev.config
)
