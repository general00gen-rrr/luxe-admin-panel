import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export const config = { api: { bodyParser: false } }

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'luxe-boutique', resource_type: 'image' },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(buffer)
    })
    const url = result.secure_url
    return NextResponse.json({ url })
  } catch (err: any) {
    console.error('Upload error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}