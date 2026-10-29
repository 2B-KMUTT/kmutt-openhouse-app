# Spec: Complete Migration from Supabase Storage to RustFS

**Status:** ready-for-agent  
**Feature Slug:** `migrate-supabase-to-rustfs`  
**Reference ADR:** [`docs/adr/0002-migrate-supabase-to-rustfs.md`](docs/adr/0002-migrate-supabase-to-rustfs.md)  
**Glossary:** [`GLOSSARY.md`](GLOSSARY.md)  

---

## Problem Statement

Currently, the KMUTT OpenHouse system relies on Supabase Storage (`@supabase/supabase-js`) as an external cloud object store for storing pictures taken by attendees (`TakePicture`) in the web application.

However, this architecture suffers from critical vulnerabilities:
1. **Uncertain Ownership & Free-Tier Inactivity:** The Supabase project URL (`https://qpzryqurlhojjbwgklwc.supabase.co`) currently points to an external third-party account whose master ownership is unverified. Furthermore, Supabase free-tier projects automatically pause when inactive, which currently causes the photo upload and backup processes (`scripts/backup-supabase.js`) to fail with network fetch errors (`fetch failed`).
2. **Third-Party Dependency Risk:** Relying on external third-party storage for an internal on-premise university event introduces latency, data governance risks, and potential downtime if the external service changes pricing, limits bandwidth, or pauses access during high-traffic event days.
3. **Storage Disconnect in Existing Workflows:** When a student deletes a photo via [`/api/student/delete-picture`](src/pages/api/student/delete-picture.ts), only the MySQL row is deleted, leaving orphaned objects in the storage bucket.
4. **Existing Idle Infrastructure:** The university infrastructure already hosts an active, containerized instance of **RustFS** (`rustfs/rustfs:latest`) on the database VM (`OpenHouse-DB`, `10.2.15.91:9000`), an S3-compatible, high-performance object store written in Rust. Yet, the Next.js web application is not integrated with it.

---

## Solution

Completely decommission Supabase Storage and migrate all object storage capabilities to the self-hosted **RustFS** cluster running within the university infrastructure.

Key components of the solution:
1. **Standard AWS S3 SDK Integration:** Replace `@supabase/supabase-js` with `@aws-sdk/client-s3`. Introduce a centralized S3 singleton service in [`src/libs/s3.ts`](src/libs/s3.ts) to handle bucket checks, uploads, and deletions with high throughput and connection pooling.
2. **Hybrid Bucket & Access Policy Provisioning:** Add an automated init service `rustfs-init` (using `rustfs/rc:latest`) to [`infra/db/docker-compose.yml`](infra/db/docker-compose.yml) to automatically provision the `openhouse-uploads` bucket with anonymous download access (`rc bucket anonymous set download`) upon startup, accompanied by an idempotent fallback in `src/libs/s3.ts`.
3. **Reverse Proxy Serving via Nginx:** Configure Nginx in [`nginx.conf`](nginx.conf) to proxy `/storage/` requests internally to RustFS (`10.2.15.91:9000`). Stored URLs in `takePicture.image_url` will use root-relative paths (`/storage/openhouse-uploads/take-pictures/...`), guaranteeing domain-agnostic delivery over SSL/HTTPS.
4. **Server-Side Upload & Lifecycle Integrity:** Keep the existing frontend webcam flow intact while updating the backend handler [`src/pages/api/student/upload.ts`](src/pages/api/student/upload.ts) to stream base64 buffers directly into RustFS. Enhance [`src/pages/api/student/delete-picture.ts`](src/pages/api/student/delete-picture.ts) to remove the physical object from RustFS whenever a photo is deleted.
5. **Clean Decommissioning & Native Volume Backup:** Eliminate `@supabase/supabase-js`, delete [`src/libs/supabase.ts`](src/libs/supabase.ts), remove all `NEXT_PUBLIC_SUPABASE_*` environment variables, and update [`scripts/backup-all.sh`](scripts/backup-all.sh) to snapshot the `rustfs_data` Docker volume directly as a native compressed archive.

---

## User Stories

1. As a Student attendee, I want to take a photo using my camera on `/app/take-picture` and upload it, so that my event memory is stored reliably without network errors caused by third-party cloud outages.
2. As a Student attendee, I want to view my uploaded photos instantly in my photo gallery on `/app/take-picture`, so that I can see my captured event memories loaded securely over HTTPS.
3. As a Student attendee, I want to delete a photo that I no longer want, so that it is removed from my account and also deleted permanently from the storage server.
4. As a Student attendee, I want the system to enforce the 5-photo quota limit, so that I cannot exceed the maximum allowed pictures per student.
5. As an Event Coordinator, I want the media storage to be hosted completely on-premise within the university infrastructure, so that our event operation does not depend on unknown or unmanaged external Supabase accounts.
6. As a System Administrator, I want RustFS to automatically create the `openhouse-uploads` bucket and apply public read permissions on system boot, so that newly deployed environments require zero manual storage configuration.
7. As a System Administrator, I want image requests (`/storage/openhouse-uploads/...`) to be routed through Nginx over port 80/443, so that the internal RustFS port 9000 is never exposed to the public internet.
8. As a System Administrator, I want stored image paths in MySQL to use root-relative URLs, so that changing the domain name (e.g., from `localhost:3000` to `openhouse.kmutt.ac.th`) never breaks image links in the database.
9. As a System Administrator, I want all Supabase SDKs, credentials, and references removed from the codebase and `.env` files, so that there is no risk of leaking dead keys or having lingering third-party network calls.
10. As a System Administrator, I want the daily backup script (`scripts/backup-all.sh`) to natively archive the `rustfs_data` Docker volume, so that all student photos are backed up consistently alongside MySQL without relying on failing cloud APIs.
11. As a Frontend Developer, I want `/api/student/upload` to maintain the existing JSON request and response contract, so that the frontend React components require zero modifications.
12. As a Backend Developer, I want a reusable S3 client module in `src/libs/s3.ts`, so that future features (e.g., activity poster uploads, banner uploads) can leverage the same RustFS infrastructure effortlessly.

---

## Implementation Decisions

### 1. S3 Client Abstraction (`src/libs/s3.ts`)
- Use `@aws-sdk/client-s3` (standard AWS SDK v3 for Node.js).
- Implement a global singleton `getS3Client()` to reuse connection pools across Next.js API routes.
- Read configuration from environment variables:
  - `S3_ENDPOINT`: defaults to `http://localhost:9000` (or `http://10.2.15.91:9000` in production).
  - `S3_ACCESS_KEY_ID`: defaults to `rustfsadmin`.
  - `S3_SECRET_ACCESS_KEY`: defaults to `af02da9b53e249301cbfbb814d08b4bf1528e85fea53f06a`.
  - `S3_BUCKET_NAME`: defaults to `openhouse-uploads`.
  - `S3_REGION`: defaults to `us-east-1`.
  - `S3_FORCE_PATH_STYLE`: `true` (mandatory for RustFS/MinIO-compatible path resolution).
- Export idempotent helper functions:
  - `uploadObjectDirect({ key, body, contentType, bucket })`: writes object to RustFS.
  - `deleteObject({ key, bucket })`: deletes object from RustFS.
  - `ensureBucketExists(bucket)`: verifies bucket presence and attempts creation if absent.

### 2. Infrastructure & Docker Compose (`infra/db/docker-compose.yml`)
- Keep `openhouse_rustfs` container as defined (`rustfs/rustfs:latest`, volume `rustfs_data:/data`).
- Add a one-shot container `rustfs-init` using `rustfs/rc:latest`:
  - `depends_on: [rustfs]`
  - `restart: "no"`
  - Executes entrypoint script:
    1. Configures alias `local` pointing to `http://rustfs:9000` with admin credentials.
    2. Runs `rc bucket create local/${S3_BUCKET_NAME:-openhouse-uploads} || true`.
    3. Runs `rc bucket anonymous set download local/${S3_BUCKET_NAME:-openhouse-uploads} || true`.

### 3. Nginx Reverse Proxy Configuration (`nginx.conf`)
- Add a proxy block for `/storage/`:
  ```nginx
  location /storage/ {
      proxy_pass http://10.2.15.91:9000/;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
  }
  ```
- Any request to `/storage/openhouse-uploads/take-pictures/<file>` is forwarded to RustFS as `GET /openhouse-uploads/take-pictures/<file>`.

### 4. Student Upload API Refactoring (`src/pages/api/student/upload.ts`)
- Remove all Supabase imports and initialization.
- Parse base64 string into `Buffer`.
- Key structure: `take-pictures/openhouse-${Date.now()}.${ext}`.
- Upload buffer directly to RustFS via `uploadObjectDirect` with `contentType: mimeType`.
- Save root-relative path to MySQL:
  ```typescript
  const publicUrl = `/storage/openhouse-uploads/${filename}`;
  await prisma.takePicture.create({
    data: {
      studentId: req.user.id,
      image_url: publicUrl,
    },
  });
  ```
- Return `{ uploaded, publicUrl }` identical to the existing contract.

### 5. Student Delete Picture API Refactoring (`src/pages/api/student/delete-picture.ts`)
- When student ownership is validated:
  1. Extract S3 key from `picture.image_url` (stripping `/storage/openhouse-uploads/` prefix).
  2. Call `deleteObject({ key: s3Key })` to remove physical asset from RustFS.
  3. Call `prisma.takePicture.delete({ where: { id } })`.

### 6. Full Supabase Removal
- Uninstall `@supabase/supabase-js` from `package.json` and prune `bun.lock` / `yarn.lock`.
- Delete `src/libs/supabase.ts`.
- Delete `scripts/backup-supabase.js`.
- Remove all `NEXT_PUBLIC_SUPABASE_*` keys from `.env` and `.env.example`.
- Ensure clean environment variables in `.env.example`:
  ```env
  S3_ENDPOINT=http://localhost:9000
  S3_ACCESS_KEY_ID=rustfsadmin
  S3_SECRET_ACCESS_KEY=your_rustfs_secret_key
  S3_BUCKET_NAME=openhouse-uploads
  NEXT_PUBLIC_S3_PUBLIC_URL=/storage/openhouse-uploads
  ```

### 7. Native Volume Backup (`scripts/backup-all.sh`)
- Replace section 4 in `scripts/backup-all.sh`:
  - Run an ephemeral container to create a gzipped tarball of the `rustfs_data` volume:
    ```bash
    mkdir -p "${BACKUP_ROOT}/storage"
    docker run --rm -v rustfs_data:/data:ro -v "${BACKUP_ROOT}/storage":/backup alpine \
      tar -czf "/backup/rustfs_storage_${YEAR}.tar.gz" -C /data .
    ```

---

## Testing Decisions

### What Makes a Good Test
- Tests must verify behavior through public HTTP and S3 interfaces without inspecting internal mock state.
- Tests must execute the full end-to-end flow:
  1. Authenticate as a student.
  2. Upload base64 image data to `/api/student/upload`.
  3. Verify HTTP 200 and return of a valid root-relative URL.
  4. Fetch the image via the public storage URL and verify the binary matches the uploaded file.
  5. Delete the picture via `/api/student/delete-picture?id=...` and verify both MySQL row and RustFS object are gone.
  6. Enforce quota: 6th upload attempt fails with HTTP 400.
  7. Verify codebase cleanliness: no imports of `@supabase/supabase-js`, `src/libs/supabase.ts` absent.

### Modules Tested
- [`src/pages/api/student/upload.ts`](src/pages/api/student/upload.ts)
- [`src/pages/api/student/delete-picture.ts`](src/pages/api/student/delete-picture.ts)
- [`src/libs/s3.ts`](src/libs/s3.ts)
- Running RustFS container (`openhouse_rustfs`) and bucket configuration.

### Seams & Prior Art
- **Primary Seam:** Integration script `scripts/verify-rustfs-migration.js` following the prior art established by `scripts/verify-auth-roles.js` and `scripts/verify-superadmin-activities.js`.
- Added to `package.json` scripts as `"test:storage": "node scripts/verify-rustfs-migration.js"`.

---

## Out of Scope

- Migrating old historical images from Supabase Cloud (the current database contains 0 `takePicture` records, and Supabase is paused/unreachable).
- Changes to the frontend camera capture UI in `src/pages/app/take-picture.tsx` (the API interface remains strictly backward-compatible).
- Multi-region S3 replication (RustFS is deployed within a single university cluster).

---

## Further Notes

- RustFS Console remains available for administrative inspection at `http://<HOST>:9001`.
- The `rustfs-init` service is configured with `restart: "no"`, ensuring it runs once on startup and exits cleanly with code 0.
