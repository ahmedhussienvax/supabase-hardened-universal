#!/bin/sh

# Wait for MinIO to be ready
until mc config host add local http://supabase-minio:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}; do
  echo "Waiting for MinIO..."
  sleep 2
done

echo "MinIO is Ready!"

# Create buckets if they don't exist
for bucket in storage backups logs snippets functions; do
  if mc ls local/$bucket > /dev/null 2>&1; then
    echo "Bucket '$bucket' already exists."
  else
    echo "Creating bucket: $bucket"
    mc mb local/$bucket
    mc anonymous set public local/$bucket
  fi
done

echo "Storage Initialization Complete!"
exit 0
