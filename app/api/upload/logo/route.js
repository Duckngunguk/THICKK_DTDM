import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.promises.mkdir(uploadsDir, { recursive: true })

    const originalName = file.name || ''
    const extFromName = originalName ? path.extname(originalName) : ''
    const ext = extFromName || (file.type ? `.${file.type.split('/')[1]}` : '.png')
    const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`
    const filePath = path.join(uploadsDir, filename)

    await fs.promises.writeFile(filePath, buffer)

    // Return a relative URL served from /public
    const url = `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
