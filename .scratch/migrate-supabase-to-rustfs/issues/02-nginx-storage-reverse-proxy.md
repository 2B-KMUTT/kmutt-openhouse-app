# 02: Nginx Storage Reverse Proxy Configuration

**What to build:**
Configure Nginx reverse proxy in `nginx.conf` to map `/storage/` requests internally to RustFS port 9000. Verify that files in `openhouse-uploads` can be retrieved anonymously via `GET /storage/openhouse-uploads/<key>` over standard HTTP/HTTPS.

**Blocked by:** 01: S3/RustFS Foundation and Automated Provisioning

**Status:** resolved

- [x] `nginx.conf` has a `/storage/` location block proxying to `http://10.2.15.91:9000/` (or configured storage host)
- [x] Header forwarding (`Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`) configured
- [x] Anonymous GET request to `/storage/openhouse-uploads/<key>` returns 200 OK with correct media type
