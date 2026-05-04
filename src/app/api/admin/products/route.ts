import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { writeJSONToGitHub } from '@/lib/github'

const FILE = path.join(process.cwd(), 'public', 'data', 'products.json')

function readProducts() {
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true })
    fs.writeFileSync(FILE, '[]')
  }
  return JSON.parse(fs.readFileSync(FILE, 'utf-8'))
}

function saveProducts(products: any[]) {
  fs.writeFileSync(FILE, JSON.stringify(products, null, 2))
}

export async function GET() {
  return NextResponse.json(readProducts())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const products = readProducts()
  const newProduct = { ...body, id: Date.now().toString(), createdAt: new Date().toISOString() }
  products.push(newProduct)
  saveProducts(products)
  await writeJSONToGitHub('public/data/products.json', products, `CMS: Add product — ${newProduct.name}`)
  return NextResponse.json(newProduct)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const products = readProducts().map((p: any) => p.id === body.id ? { ...p, ...body } : p)
  saveProducts(products)
  await writeJSONToGitHub('public/data/products.json', products, `CMS: Update product — ${body.name}`)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const products = readProducts().filter((p: any) => p.id !== id)
  saveProducts(products)
  await writeJSONToGitHub('public/data/products.json', products, `CMS: Delete product ${id}`)
  return NextResponse.json({ success: true })
}
