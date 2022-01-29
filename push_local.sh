#!/bin/bash
set -e

destdir=../htmluibuild
rm -rf $destdir/build
cp -rv build $destdir
