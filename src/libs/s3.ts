import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

export interface S3Config {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  forcePathStyle: boolean;
}

export function getS3Config(): S3Config {
  const defaultEndpoint = process.env.NODE_ENV === "production"
    ? "http://10.2.15.91:9000"
    : "http://localhost:9000";

  const endpoint = process.env.S3_ENDPOINT || defaultEndpoint;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY || "rustfsadmin";
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY || "af02da9b53e249301cbfbb814d08b4bf1528e85fea53f06a";
  const bucketName = process.env.S3_BUCKET_NAME || "openhouse-uploads";

  return {
    endpoint,
    region: process.env.S3_REGION || "us-east-1",
    accessKeyId,
    secretAccessKey,
    bucketName,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
  };
}

let _moduleS3ClientInstance: S3Client | undefined;

declare global {
  // eslint-disable-next-line no-var
  var _s3ClientInstance: S3Client | undefined;
}

export function getS3Client(): S3Client {
  if (_moduleS3ClientInstance) {
    return _moduleS3ClientInstance;
  }
  if (globalThis._s3ClientInstance) {
    return globalThis._s3ClientInstance;
  }

  const config = getS3Config();
  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: config.forcePathStyle,
  });

  _moduleS3ClientInstance = client;
  globalThis._s3ClientInstance = client;

  return client;
}

/**
 * Returns the public root-relative storage URL for a given object key
 */
export function getPublicStorageUrl(key: string, bucketName?: string): string {
  const bucket = bucketName || getS3Config().bucketName;
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return `/storage/${bucket}/${cleanKey}`;
}

/**
 * Extracts the S3 object key from a public storage URL
 */
export function extractKeyFromStorageUrl(publicUrl: string, bucketName?: string): string {
  const bucket = bucketName || getS3Config().bucketName;
  const prefix = `/storage/${bucket}/`;
  if (publicUrl.startsWith(prefix)) {
    return publicUrl.slice(prefix.length);
  }
  return publicUrl.startsWith("/") ? publicUrl.slice(1) : publicUrl;
}

/**
 * Ensures bucket exists in RustFS idempotently
 */
export async function ensureBucketExists(bucketName?: string): Promise<string> {
  const s3 = getS3Client();
  const targetBucket = bucketName || getS3Config().bucketName;

  try {
    await s3.send(new HeadBucketCommand({ Bucket: targetBucket }));
  } catch (err: any) {
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
      await s3.send(new CreateBucketCommand({ Bucket: targetBucket }));
    } else {
      try {
        await s3.send(new CreateBucketCommand({ Bucket: targetBucket }));
      } catch (createErr: any) {
        if (createErr.name !== "BucketAlreadyOwnedByYou" && createErr.name !== "BucketAlreadyExists") {
          throw createErr;
        }
      }
    }
  }

  return targetBucket;
}

/**
 * Direct server upload of Buffer/string to RustFS
 */
export async function uploadObjectDirect(params: {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
  bucket?: string;
  metadata?: Record<string, string>;
}): Promise<{ bucket: string; key: string; publicUrl: string }> {
  const s3 = getS3Client();
  const bucket = params.bucket || getS3Config().bucketName;
  await ensureBucketExists(bucket);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: typeof params.body === "string" ? Buffer.from(params.body) : params.body,
      ContentType: params.contentType,
      Metadata: params.metadata,
    })
  );

  return {
    bucket,
    key: params.key,
    publicUrl: getPublicStorageUrl(params.key, bucket),
  };
}

/**
 * Deletes an object from RustFS
 */
export async function deleteObject(params: {
  key: string;
  bucket?: string;
}): Promise<void> {
  const s3 = getS3Client();
  const bucket = params.bucket || getS3Config().bucketName;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: params.key,
    })
  );
}

/**
 * Deletes an object directly by its public storage URL
 */
export async function deleteObjectByUrl(publicUrl: string, bucketName?: string): Promise<void> {
  const bucket = bucketName || getS3Config().bucketName;
  const key = extractKeyFromStorageUrl(publicUrl, bucket);
  await deleteObject({ key, bucket });
}
