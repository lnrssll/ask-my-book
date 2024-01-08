#!/bin/bash

if [ $# -eq 0 ]; then
	echo "Usage: $0 <email>"
	exit 1
fi

if [ ! -f .env ]; then
	echo ".env file not found"
	exit 1
fi
source .env

SALTED="$1$SALT"

echo $SALTED | sha256sum | head -c 64
echo
