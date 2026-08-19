// Resolves an S3 object key into a public URL. Bucket is public-read, so
// this is plain string construction — no AWS SDK, no signing needed for
// reads. Runs in both Server and Client Components, hence NEXT_PUBLIC_ —
// bucket name/region aren't secrets (derivable from any image URL anyway).
export function getS3Url(key: string) {
  const base =
    process.env.NEXT_PUBLIC_S3_PUBLIC_URL_BASE ||
    `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com`
  return `${base}/${key}`
}

// storage_path is a product_images-specific column name — kept as a
// distinct export so call sites read clearly, both just delegate to the
// same S3 URL builder.
export function getProductImageUrl(storagePath: string) {
  return getS3Url(storagePath)
}
