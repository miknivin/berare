import "server-only"
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Deliberately NOT named AWS_REGION/AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY
// — those are reserved on Vercel (its functions run on AWS Lambda, which
// injects its own values into exactly those names, silently overriding
// anything set in the dashboard).
function getClient() {
  return new S3Client({
    region: process.env.NEXT_PUBLIC_S3_REGION!,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  })
}

// Presigned PUT so the browser uploads the file bytes straight to S3 —
// never proxied through our server, no Server Action body-size limit to
// worry about.
export async function createPresignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(getClient(), command, { expiresIn: 300 })
}

export async function deleteS3Object(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: key,
  })
  await getClient().send(command)
}

// Bucket is public-read — plain URL construction, no signing needed for
// reads. NEXT_PUBLIC_S3_PUBLIC_URL_BASE is an optional override for later
// (e.g. fronting the bucket with CloudFront) without touching this call
// site. Bucket name/region aren't secrets (derivable from any image URL
// anyway), so NEXT_PUBLIC_ here is intentional — the storefront's client
// components need the same values to render <Image> src attributes.
export function getPublicUrl(key: string) {
  const base =
    process.env.NEXT_PUBLIC_S3_PUBLIC_URL_BASE ||
    `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com`
  return `${base}/${key}`
}
