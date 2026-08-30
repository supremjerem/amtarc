#!/bin/sh
set -e

# Idempotent: only applies migrations that haven't run yet, so it's safe on
# every container start (including the server's automatic 03:00 reboots).
node_modules/.bin/prisma migrate deploy

exec "$@"
