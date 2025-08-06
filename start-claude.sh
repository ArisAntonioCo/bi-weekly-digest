#!/bin/bash

# Load environment variables from .env.local file (or .env if it exists)
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
elif [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Start Claude Code
claude