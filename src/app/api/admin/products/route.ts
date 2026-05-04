import { NextRequest, NextResponse } from 'next/server'

const GH = 'https://api.github.com'
const FILE_PATH = 'public/data/products.json'

async function ghGet(path: string) {
  const res = await fetch(GH + '/repos/' + process.env.GITHUB_REPO + '/contents/' + path, {
    headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN, Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  })
  if (!res.ok) return { content: [], sha: null }
  const data = await res.json()
  return { content: JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8')), sha: data.sha }
}

async function ghWrite(content: object, sha: string | null, message: string) {
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
    branch: process.env.GITHUB_BRANCH || 'main',
  }
  if (sha) body.sha = sha
  const res = await fetch(GH + '/repos/' + process.env.GITHUB_REPO + '/contents/' + FILE_PATH, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
}

export async function GET() {
  try {
    const { content } = await ghGet(FILE_PATH)
    return NextResponse.json(Array.isArray(content) ? content : [])
  } catch { return NextResponse.json([]) }
}

export async function POST(request: NextRequest) {
  try {
    const product = await request.json()
    product.id = product.id || Date.now().toString()
    product.createdAt = new Date().toISOString()
    const { content, sha } = await ghGet(FILE_PATH)
    const list = Array.isArray(content) ? content : []
    list.push(product)
    await ghWrite(list, sha, 'CMS: Add ' + product.name)
    return NextResponse.json({ success: true, product })
  } catch (e) { return NextResponse.json({ success: false, error: String(e) }, { status: 500 }) }
}

export async function PUT(request: NextRequest) {
  try {
    const product = await request.json()
    const { content, sha } = await ghGet(FILE_PATH)
    const list = Array.isArray(content) ? content : []
    const i = list.findIndex((p: Record<string, unknown>) => p.id === product.id)
    if (i === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    list[i] = { ...list[i], ...product }
    await ghWrite(list, sha, 'CMS: Update ' + product.name)
    return NextResponse.json({ success: true, product: list[i] })
  } catch (e) { return NextResponse.json({ success: false, error: String(e) }, { status: 500 }) }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    const { content, sha } = await ghGet(FILE_PATH)
    const list = Array.isArray(content) ? content : []
    const filtered = list.filter((p: Record<string, unknown>) => p.id !== id)
    if (filtered.length === list.length) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    await ghWrite(filtered, sha, 'CMS: Delete ' + id)
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ success: false, error: String(e) }, { status: 500 }) }
}
