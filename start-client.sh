#!/bin/sh
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd "/Users/garrettuptmore/AUCTION TRACKER/client"
exec node node_modules/.bin/vite --port 5173 --host
