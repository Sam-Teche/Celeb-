import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// multer-storage-cloudinary doesn't ship great types, cast as any for params
const storage = new CloudinaryStorage({
  cloudinary,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: {
    folder: 'celebconnect/celebs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 1000, crop: 'fill', gravity: 'face' }],
  } as Record<string, unknown>,
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
})

export { cloudinary, upload }
