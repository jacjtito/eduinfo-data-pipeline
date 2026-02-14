#!/bin/bash

# Database Backup Script for evalLycee
# Backs up the entire database including all schemas

set -e  # Exit on error

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
BACKUP_DIR="./data/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/evalLycee_backup_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🗄️  Database Backup Script"
echo "=========================="
echo ""
echo "Database: $DB_NAME"
echo "Host:     $DB_HOST:$DB_PORT"
echo "User:     $DB_USER"
echo ""

# Find pg_dump
PG_DUMP=""
if command -v pg_dump &> /dev/null; then
    PG_DUMP="pg_dump"
elif [ -f "/Applications/pgAdmin 4.app/Contents/SharedSupport/pg_dump" ]; then
    PG_DUMP="/Applications/pgAdmin 4.app/Contents/SharedSupport/pg_dump"
elif [ -f "/usr/local/bin/pg_dump" ]; then
    PG_DUMP="/usr/local/bin/pg_dump"
else
    echo "❌ Error: pg_dump not found!"
    echo ""
    echo "Please install PostgreSQL or add it to your PATH:"
    echo "  - Using Homebrew: brew install postgresql"
    echo "  - Or add pgAdmin path: export PATH=\"/Applications/pgAdmin 4.app/Contents/SharedSupport:\$PATH\""
    exit 1
fi

echo "Using: $PG_DUMP"
echo ""

# Perform backup
echo "⏳ Creating backup..."
PGPASSWORD="$DB_PASSWORD" "$PG_DUMP" \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-privileges \
    --verbose \
    --file="$BACKUP_FILE" \
    2>&1 | grep -E "(processing|dumping)" || true

if [ $? -eq 0 ] && [ -f "$BACKUP_FILE" ]; then
    echo ""
    echo "✅ Backup created successfully!"

    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "   File: $BACKUP_FILE"
    echo "   Size: $BACKUP_SIZE"

    # Compress backup
    echo ""
    echo "⏳ Compressing backup..."
    gzip -f "$BACKUP_FILE"

    COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    echo "✅ Compressed: $COMPRESSED_FILE"
    echo "   Size: $COMPRESSED_SIZE"
    echo ""

    # List recent backups
    echo "📋 Recent backups:"
    ls -lht "$BACKUP_DIR" | head -6
    echo ""

    # Cleanup old backups (keep last 10)
    echo "🧹 Cleaning up old backups (keeping last 10)..."
    ls -t "$BACKUP_DIR"/evalLycee_backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    echo ""

    echo "✨ Backup complete!"
    echo ""
    echo "To restore this backup:"
    echo "  gunzip -c $COMPRESSED_FILE | psql -h $DB_HOST -U $DB_USER -d $DB_NAME"

else
    echo ""
    echo "❌ Backup failed!"
    exit 1
fi
