import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }

    if (!request.body) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(filename, request.body, {
      access: 'public',
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Error uploading to Blob:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
