import { NextRequest, NextResponse } from 'next/server'
import { writeJSONToGitHub } from '@/lib/github'

const GITHUB_PATH = 'public/data/products.json'

async function readProducts() {
  try {
    const token = process.env.GITHUB_TOKEN
    const repo = process.env.GITHUB_REPO
    const branch = process.env.GITHUB_BRANCH || 'main'
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${GITHUB_PATH}?ref=${branch}&t=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'luxe-cms',
          'Accept': 'application/vnd.github.v3+json'
        },
        cache: 'no-store'
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    const content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8')
    return JSON.parse(content)
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
