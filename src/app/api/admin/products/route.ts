import { NextRequest, NextResponse } from 'next/server'

const GH = 'https://api.github.com'
const FILE_PATH = 'public/data/products.json'

async function ghGet(path: string) {
  const url = GH + '/repos/' + process.env.GITHUB_REPO + '/contents/' + path
  const res = await fetch(url, {
    headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN, Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  })
  if (!res.ok) return { content: [], sha: null }
  const data = await res.json()
  const decoded = Buffer.from(data.content, 'base64').toString('utf-8')
  return { content: JSON.parse(decoded), sha: data.sha }
}

async function ghWrite(content: object, sha: string | null, message: string) {
  const url = GH + '/repos/' + process.env.GITHUB_REPO + '/contents/' + FILE_PATH
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64')
  const body: Record<string, unknown> = {
    message,
    content: encoded,
    branch: process.env.GITHUB_BRANCH || 'main',
  }
  if (sha) body.sha = sha
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
}

export async function GET() {
  try {
    const result = await ghGet(FILE_PATH)
    const list = result.content
    return NextResponse.json(Array.isArray(list) ? list : [])
  } catch { return NextResponse.json([]) }
}

export async function POST(request: NextRequest) {
  try {
    const product = await request.json()
    const pid = product.id ? product.id : Date.now().toString()
    product.id = pid
    product.createdAt = new Date().toISOString()
    const result = await ghGet(FILE_PATH)
    const list = Array.isArray(result.content) ? result.content : []
    list.push(product)
    await ghWrite(list, result.sha, 'CMS: Add ' + product.name)
    return NextResponse.json({ success: true, product })
  } catch (e) { return NextResponse.json({ success: false, error: String(e) }, { status: 500 }) }
}

export async function PUT(request: NextRequest) {
  try {
    const product = await request.json()
    const result = await ghGet(FILE_PATH)
    const list = Array.isArray(result.content) ? result.content : []
    const i = list.findIndex((p: Record<string, unknown>) => p.id === product.id)
    if (i === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    list[i] = Object.assign({}, list[i], product)
    await ghWrite(list, result.sha, 'CMS: Update ' + product.name)
    return NextResponse.json({ success: true, product: list[i] })
  } catch (e) { return NextResponse.json({ success: false, error: String(e) }, { status: 500 }) }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const id = body.id
    const result = await ghGet(FILE_PATH)
    const list = Array.isArray(result.content) ? result.content : []
    const filtered = list.filter((p: Record<string, unknown>) => p.id !== id)
    if (filtered.length === list.length) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    await ghWrite(filtered, result.sha, 'CMS: Delete ' + id)
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ success: false, error: String(e) }, { status: 500 }) }
}