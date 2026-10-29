# 01: S3/RustFS Foundation and Automated Provisioning

**What to build:**
Install `@aws-sdk/client-s3` and create the central S3 singleton module (`src/libs/s3.ts`) capable of connecting to RustFS, checking bucket presence, uploading direct buffers, and deleting objects. Add the `rustfs-init` service in `infra/db/docker-compose.yml` to automatically create the `openhouse-uploads` bucket and apply anonymous download permissions on startup.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] `@aws-sdk/client-s3` installed in `package.json`
- [x] `src/libs/s3.ts` provides `getS3Client()`, `ensureBucketExists()`, `uploadObjectDirect()`, `deleteObject()`
- [x] `infra/db/docker-compose.yml` includes `rustfs-init` using `rustfs/rc:latest` to create bucket `openhouse-uploads` and set anonymous download policy
- [x] Direct smoke test verifies file upload and retrieval from RustFS
