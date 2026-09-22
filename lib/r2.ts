import { AwsClient } from "aws4fetch";
import { MAX_IMAGE_BYTES, type PackageFormValues } from "@/lib/validation";

// ponytail: SERVER-ONLY — reads R2 secrets, never import from client components.
// Uploads happen only when an admin saves a package (never on file-pick).

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function fail(message: string, status: number): never {
  throw Object.assign(new Error(message), { status });
}

function r2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    fail("Image storage is not configured", 500);
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl } as Record<string, string>;
}

/** Upload one validated image to R2, return its public URL. */
export async function uploadPackageImage(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) fail("Only JPEG, PNG and WebP images are allowed", 400);
  if (file.size > MAX_IMAGE_BYTES) fail("Each image must be 5 MB or less", 400);
  const { accountId, accessKeyId, secretAccessKey, bucket, publicUrl } = r2Config();
  // ponytail: random key — ignores the user's filename (no traversal,
  // no overwrite, no collision). Extension comes from the validated type.
  const key = `packages/${crypto.randomUUID()}.${ext}`;
  const client = new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" });
  const res = await client.fetch(`https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`, {
    method: "PUT",
    headers: { "Content-Type": file.type, "Cache-Control": "public, max-age=31536000, immutable" },
    body: Buffer.from(await file.arrayBuffer()),
  });
  if (!res.ok) fail("Image upload failed, please try again", 502);
  return `${publicUrl}/${key}`;
}

/**
 * Shared POST/PUT body parser: JSON as before, or multipart
 * (`data` = package JSON string, `files` = images) when the form has uploads.
 * Files are uploaded to R2 ONLY here — i.e. only on save, never on pick.
 */
export async function parsePackageRequest(req: Request): Promise<PackageFormValues> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return (await req.json()) as PackageFormValues;
  }
  const form = await req.formData().catch(() => fail("Invalid request body", 400));
  const raw = form.get("data");
  if (typeof raw !== "string") fail("Missing package data", 400);
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    fail("Invalid package data", 400);
  }
  const existing = Array.isArray(data.gallery_urls) ? (data.gallery_urls as unknown[]) : [];
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (existing.length + files.length > 12) fail("A package holds at most 12 images", 400);
  const urls = await Promise.all(files.map(uploadPackageImage));
  return { ...data, gallery_urls: [...existing, ...urls] } as PackageFormValues;
}
