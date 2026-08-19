// Client-safe S3 URL builder — mirrors the storefront's lib/image.ts.
// Kept separate from lib/s3.ts (which is "server-only" and holds the AWS
// SDK/credentials) so Client Components can build a preview URL for a key
// they just uploaded without waiting on a server round-trip.
export function getS3Url(key: string) {
  const base =
    process.env.NEXT_PUBLIC_S3_PUBLIC_URL_BASE ||
    `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com`
  return `${base}/${key}`
}
