#!/bin/bash
libraries=(user auth message numbers, constant)
# apps=(publisher db-data-seeder subscriber receive-sms telecom db-backuper)
apps=(publisher db-data-seeder subscriber receive-sms telecom )

green=`tput setaf 2`


echo "building libraries..."
for lib in "${libraries[@]}"
do
    echo "building library => ${green}$lib"
    nest build $lib
done
echo "done"

echo "building apps..."
for app in "${apps[@]}"
do
    echo "building app => ${green}$app"
    nest build $app
    
done
echo "done"

echo "Docker compose starting..."

docker-compose up --build