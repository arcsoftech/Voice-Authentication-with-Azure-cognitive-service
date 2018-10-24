#!/bin/bash

# Script to gnerate file meta data report
read -p "Enter directory path : " PATH
read -p "Enter directory path for exclude : " EXCLUDEPATH
IFS=', ' read -r -a exludepaths <<< "$EXCLUDEPATH"
EXCLUDEPATH=''
for i in "${exludepaths[@]}"
    do
      :
      EXCLUDEPATH+=' --exclude='$i'*'
    done
echo $EXCLUDEPATH

exec find $PATH -type f -exec du -h --exclude=$EXCLUDEPATH*  {} \+