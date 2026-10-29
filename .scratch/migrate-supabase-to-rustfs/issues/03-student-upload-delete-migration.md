# 03: Student Photo Upload & Deletion Migration to RustFS

**What to build:**
Refactor `src/pages/api/student/upload.ts` to stream base64 images directly into RustFS (`openhouse-uploads/take-pictures/`), storing root-relative paths (`/storage/openhouse-uploads/take-pictures/...`) in `takePicture.image_url`. Refactor `src/pages/api/student/delete-picture.ts` to physically delete the object from RustFS whenever a photo is deleted. Verify the frontend camera gallery displays photos without issues.

**Blocked by:** 01: S3/RustFS Foundation and Automated Provisioning, 02: Nginx Storage Reverse Proxy Configuration

**Status:** resolved

- [x] `src/pages/api/student/upload.ts` uses `uploadObjectDirect` from `src/libs/s3.ts` instead of Supabase
- [x] Uploaded image is stored with root-relative path `/storage/openhouse-uploads/...` in MySQL `takePicture`
- [x] 5-picture quota per student is strictly enforced
- [x] `src/pages/api/student/delete-picture.ts` extracts the S3 key and calls `deleteObject` from `src/libs/s3.ts`
- [x] Frontend `/app/take-picture` loads and displays uploaded pictures cleanly
