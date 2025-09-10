export async function compressImage(file: File, maxWidth = 1280, quality = 0.8): Promise<Blob> {
  const img = await loadImage(file)
  const ratio = img.width > maxWidth ? maxWidth / img.width : 1
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(img.width * ratio)
  canvas.height = Math.round(img.height * ratio)
  const ctx = canvas.getContext("2d")
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob || file), "image/jpeg", quality)
  })
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = reject
    img.src = url
  })
}
