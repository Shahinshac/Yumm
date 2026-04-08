#!/usr/bin/env bash
set -e

# Render is configured with Root Directory=backend.
# Move to repository root so backend.* imports work reliably.
cd ..

exec gunicorn --worker-class gthread --threads 8 -w 1 --bind 0.0.0.0:${PORT:-10000} backend.run:app
