import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}.${ext}`
  const filepath = path.join(process.cwd(), 'public', 'uploads', filename)
  fs.writeFileSync(filepath, buffer)
  return NextResponse.json({ url: `/uploads/${filename}` })
}
