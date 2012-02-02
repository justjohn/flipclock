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
cp -r lib $TARGET/
cp -r css $TARGET/
cp -r templates $TARGET/
cp -r vendor $TARGET/

# Copy only the required images
mkdir $TARGET/images
cp -r images/digits $TARGET/images/
cp -r images/logos $TARGET/images/
mkdir $TARGET/images/icons
cp images/icons/28-star.png $TARGET/images/icons
cp images/icons/78-stopwatch.png $TARGET/images/icons
cp images/icons/11-clock.png $TARGET/images/icons
cp images/icons/00-up.png $TARGET/images/icons
cp images/icons/00-down.png $TARGET/images/icons

cd $TARGET
echo "- Creating ZIP archive"
zip -r ../$TARGET.zip *
cd ..

echo "- Removing build."
rm -Rf $TARGET