import { NextRequest, NextResponse } from 'next/server'
const GH = 'https://api.github.com'
const FILE_PATH = 'public/data/products.json'
const SITE_URL = 'https://studio-pearl-eta.vercel.app'
async function ghGet(path: string) {
  const url = GH + '/repos/' + process.env.GITHUB_REPO + '/contents/' + path
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN, Accept: 'application/vnd.github+json' }, cache: 'no-store' })
  const data = await res.json()
  const decoded = Buffer.from(data.content, 'base64').toString('utf-8')
  return { content: JSON.parse(decoded), sha: data.sha }
}
async function ghWrite(content: object, sha: string | null, message: string) {
  const url = GH + '/repos/' + process.env.GITHUB_REPO + '/contents/' + FILE_PATH
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64')
  const body: Record<string, unknown> = { message, content: encoded, branch: process.env.GITHUB_BRANCH || 'main' }
  if (sha) body.sha = sha
  const res = await fetch(url, { method: 'PUT', headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}
async function getAllProducts(): Promise<any[]> {
  const res = await fetch(SITE_URL + '/api/products', { cache: 'no-store' })
  const all = await res.json()
  return Array.isArray(all) ? all : []
}
export async function GET() {
  try {
    const all = await getAllProducts()
    return NextResponse.json(all)
  } catch { return NextResponse.json([]) }
}
export async function POST(request: NextRequest) {
  try {
    const product = await request.json()
    product.id = product.id || Date.now().toString()
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
    const allProducts = await getAllProducts()
    const i = allProducts.findIndex((p: any) => p.id === product.id)
    if (i === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    allProducts[i] = Object.assign({}, allProducts[i], product)
    const result = await ghGet(FILE_PATH)
    await ghWrite(allProducts, result.sha, 'CMS: Update ' + product.name)
    return NextResponse.json({ success: true, product: allProducts[i] })
  } catch (e) { return NextResponse.json({ success: false, error: String(e) }, { status: 500 }) }
}
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const id = body.id
    const allProducts = await getAllProducts()
    const filtered = allProducts.filter((p: any) => p.id !== id)
    if (filtered.length === allProducts.length) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    const result = await ghGet(FILE_PATH)
    await ghWrite(filtered, result.sha, 'CMS: Delete ' + id)
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ success: false, error: String(e) }, { status: 500 }) }
}