import { NextRequest, NextResponse } from 'next/server'
import { writeJSONToGitHub } from '@/lib/github'

const GITHUB_PATH = 'public/data/products.json'
const RAW_URL = `https://raw.githubusercontent.com/${process.env.GITHUB_REPO}/${process.env.GITHUB_BRANCH}/${GITHUB_PATH}`

async function readProducts() {
  try {
    const res = await fetch(RAW_URL + '?t=' + Date.now(), { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

export async function GET() {
  return NextResponse.json(await readProducts())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const products = await readProducts()
  const newProduct = { ...body, id: Date.now().toString(), createdAt: new Date().toISOString() }
  products.push(newProduct)
  await writeJSONToGitHub(GITHUB_PATH, products, `CMS: Add ${newProduct.name}`)
  return NextResponse.json(newProduct)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const products = (await readProducts()).map((p: any) => p.id === body.id ? { ...p, ...body } : p)
  await writeJSONToGitHub(GITHUB_PATH, products, `CMS: Update ${body.name}`)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const products = (await readProducts()).filter((p: any) => p.id !== id)
  await writeJSONToGitHub(GITHUB_PATH, products, `CMS: Delete ${id}`)
  return NextResponse.json({ success: true })
}
