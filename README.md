# Kopia HTML Ui

This is the repository for the html UI for kopia. It is bundled as part of the [kopia UI releases (e.g. `KopiaUI-Setup-X.Y.Z.exe` or a `kopiaui` package)](https://kopia.io/docs/installation/#two-variants-of-kopia).

## Reporting issues

If you want to report a bug or have an idea for a feature request, please use the [issues list of the main kopia repository](https://github.com/kopia/kopia/issues?q=is%3Aissue+is%3Aopen+gui).

## Development

The kopia UI uses [React](https://react.dev/). It connects to a kopia server running locally.

If you want to run a local version of the GUI (e.g. for development), you need to start a kopia server first.
As the UI version might be ahead of the latest release and might depend on changes in the server, it's recommended
that you also clone the [kopia server repository](https://github.com/kopia/kopia#readme) and start the server from there (GO required).

You can use this script like this one. Here it's assumed that you cloned the server repo next to the htmlui.

```bash
#! /bin/bash
(
  cd ../kopia
  # start kopia server with default repo:
  #go run . server start --insecure --without-password --disable-csrf-token-checks --log-level=debug
  
  # for development you might want to use another repository for testing only, not your normal one, so you could use, e.g. 
  go run . server start --insecure --without-password --disable-csrf-token-checks --log-level=debug  --config-file=$HOME/.config/kopia/disabled/repository-dev.config
)
```
