#!/bin/sh

echo "Packaging chrome app"

TARGET=flipclock

cd www
echo "- Creating ZIP archive"
zip -r ../$TARGET.zip *
cd ..

