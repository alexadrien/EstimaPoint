#!/bin/sh

cd project
yarn
yarn build
cd
git clone git@github.com:alexadrien/alexadrien.github.io.git
cd alexadrien.github.io/estimapoint/
cp -r ../../project/build/* ./
cd ../
git add .
git config --global user.email $GH_EMAIL
git config --global user.name $GH_NAME
git commit -m "build estimapoint"
git push