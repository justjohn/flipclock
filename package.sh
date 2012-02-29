#!/bin/sh

echo "Packaging chrome app"

TARGET=flipclock

if [ -d $TARGET ]; then
	echo "- Removing old build."
	rm -Rf $TARGET
fi

echo "- Copying resources"
mkdir $TARGET
cp index.html $TARGET/
cp favicon.ico $TARGET/
cp manifest.json $TARGET/
cp apple-touch-icon-precomposed.png $TARGET/
cp -r www $TARGET/


cd $TARGET
echo "- Creating ZIP archive"
zip -r ../$TARGET.zip *
cd ..

echo "- Removing build."
rm -Rf $TARGET
