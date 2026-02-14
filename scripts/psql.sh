#!/bin/bash

# PostgreSQL client wrapper for eduInfo database
# Makes it easier to run psql commands without typing the full path

PSQL="/Applications/pgAdmin 4.app/Contents/SharedSupport/psql"
export PGPASSWORD=aftp
PGHOST=localhost
PGPORT=5433
PGUSER=aurel
PGDATABASE=evalLycee

# Run psql with the provided arguments
"$PSQL" -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" "$@"
