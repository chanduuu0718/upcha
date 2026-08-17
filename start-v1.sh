#!/usr/bin/env bash
set -e
(cd backend && npm install && npm run dev) &
BACKEND_PID=$!
trap 'kill $BACKEND_PID 2>/dev/null || true' EXIT
sleep 2
cd frontend/product-selector
npm install
npm run dev
