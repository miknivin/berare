// Lightweight guardrail against obviously-wrong uploads (a raw 15MB camera
// photo, an 8000px screenshot) — not an attempt to enforce the "ideal"
// product image size. The presigned-URL upload flow has no server-side
// size/dimension check (S3 accepts whatever's PUT to it), so this is the
// only place anything gets caught before it lands in the bucket.
export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_IMAGE_DIMENSION_PX = 4000

export type ImageValidationResult = { ok: true } | { ok: false; error: string }

export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return { ok: false, error: `"${file.name}" is too large (max ${MAX_IMAGE_FILE_SIZE_BYTES / (1024 * 1024)}MB).` }
  }

  const dimensions = await getImageDimensions(file)
  if (dimensions && (dimensions.width > MAX_IMAGE_DIMENSION_PX || dimensions.height > MAX_IMAGE_DIMENSION_PX)) {
    return {
      ok: false,
      error: `"${file.name}" is too large (max ${MAX_IMAGE_DIMENSION_PX}×${MAX_IMAGE_DIMENSION_PX}px).`,
    }
  }

  return { ok: true }
}

// Resolves null (rather than rejecting) if the browser can't decode the
// file as an image at all — the file-size check above still applies, and
// the actual upload/S3 content-type check catches a non-image regardless.
function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}
