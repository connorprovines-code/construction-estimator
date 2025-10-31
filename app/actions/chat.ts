'use server'

import { put } from '@vercel/blob'

const PDF_WEBHOOK_URL = 'https://connorprovines.app.n8n.cloud/webhook/construction-estimator-pdf'

export async function sendChatMessage(formData: FormData) {
  try {
    const message = formData.get('message') as string
    const sessionId = formData.get('sessionId') as string
    const pdfFile = formData.get('pdf') as File | null

    // Validate inputs
    if (!message || typeof message !== 'string') {
      return {
        error: 'Message is required and must be a string',
        response: null,
      }
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return {
        error: 'Session ID is required and must be a string',
        response: null,
      }
    }

    let pdfUrl: string | null = null

    // Upload PDF to Vercel Blob if present
    if (pdfFile) {
      console.log('Uploading PDF file:', pdfFile.name, 'Size:', pdfFile.size, 'bytes')

      try {
        const blob = await put(pdfFile.name, pdfFile, {
          access: 'public',
          addRandomSuffix: true,
        })
        pdfUrl = blob.url
        console.log('PDF uploaded to Blob:', pdfUrl)
      } catch (uploadError) {
        console.error('Error uploading PDF to Blob:', uploadError)
        return {
          error: 'Failed to upload PDF',
          response: null,
        }
      }
    }

    // Send message and PDF URL to n8n webhook (not the actual file)
    const webhookPayload = {
      message,
      sessionId,
      pdfUrl: pdfUrl || null,
    }

    // Forward the request to n8n webhook with JSON payload
    console.log('Sending request to webhook:', PDF_WEBHOOK_URL, webhookPayload)
    const n8nResponse = await fetch(PDF_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('n8n webhook returned error:', n8nResponse.status, errorText)
      return {
        error: 'Failed to process message',
        details: errorText,
        response: null,
      }
    }

    const n8nData = await n8nResponse.json()

    // Return the response from n8n
    return {
      error: null,
      response: n8nData.response || n8nData.message || 'No response from assistant',
    }
  } catch (error) {
    console.error('Error in chat action:', error)
    return {
      error: 'Internal server error',
      response: null,
    }
  }
}
