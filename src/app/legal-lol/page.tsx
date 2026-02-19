import { readdir } from 'fs/promises'
import path from 'path'
import type { Metadata } from 'next'
import { LegalLolClient } from './LegalLolClient'

export const metadata: Metadata = {
  title: 'Legal | Young Muslims App',
}

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

async function getRandomImage(): Promise<string> {
  try {
    const dir = path.join(process.cwd(), 'public', 'legal-lol')
    const files = await readdir(dir)
    const images = files.filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
    if (images.length === 0) return '/legal-lol/aqil_peace.jpg'
    const pick = images[Math.floor(Math.random() * images.length)]
    return `/legal-lol/${encodeURIComponent(pick)}`
  } catch {
    return '/legal-lol/aqil_peace.jpg'
  }
}

export default async function LegalLolPage() {
  const imageSrc = await getRandomImage()

  return <LegalLolClient imageSrc={imageSrc} />
}
