#!/bin/bash

# Script to gnerate file meta data report

read -p "Enter directory path : " PATH

exec find $PATH -type f -exec du -h   {} \+ > report.txt