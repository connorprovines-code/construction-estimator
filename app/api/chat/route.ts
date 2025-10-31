import { NextRequest, NextResponse } from 'next/server'

const PDF_WEBHOOK_URL = 'https://connorprovines.app.n8n.cloud/webhook/construction-estimator-pdf'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const message = formData.get('message') as string
    const sessionId = formData.get('sessionId') as string
    const pdfFile = formData.get('pdf') as File | null

    // Validate inputs
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Session ID is required and must be a string' },
        { status: 400 }
      )
    }

    // Create form data for n8n webhook
    const webhookFormData = new FormData()
    webhookFormData.append('message', message)
    webhookFormData.append('sessionId', sessionId)

    if (pdfFile) {
      webhookFormData.append('pdf', pdfFile)
    }

    // Forward the request to n8n PDF webhook
    const n8nResponse = await fetch(PDF_WEBHOOK_URL, {
      method: 'POST',
      body: webhookFormData,
    })

    if (!n8nResponse.ok) {
      console.error('n8n webhook returned error:', n8nResponse.status)
      return NextResponse.json(
        { error: 'Failed to process message' },
        { status: 500 }
      )
    }

    const n8nData = await n8nResponse.json()

    // Return the response from n8n
    return NextResponse.json({ response: n8nData.response || n8nData.message || 'No response from assistant' })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
