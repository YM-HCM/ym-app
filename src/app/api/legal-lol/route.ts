import { readdir } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'legal-lol')
  const files = await readdir(dir)
  const images = files.filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))

  if (images.length === 0) {
    return NextResponse.json({ error: 'No images found' }, { status: 404 })
  }

  const pick = images[Math.floor(Math.random() * images.length)]
  return NextResponse.json({ image: `/legal-lol/${encodeURIComponent(pick)}` })
}
