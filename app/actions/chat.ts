'use server'

import { v4 as uuidv4 } from 'uuid'

const PDF_WEBHOOK_URL = 'https://connorprovines.app.n8n.cloud/webhook/construction-estimator-pdf'

export async function sendChatMessage(formData: FormData) {
  try {
    const message = formData.get('message') as string
    const sessionId = formData.get('sessionId') as string
    const pdfUrl = formData.get('pdfUrl') as string | null

    // Validate inputs
    if (!message || typeof message !== 'string') {
      return {
        error: 'Message is required and must be a string',
        jobId: null,
      }
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return {
        error: 'Session ID is required and must be a string',
        jobId: null,
      }
    }

    // Generate unique job ID
    const jobId = uuidv4()

    // Get the callback URL (use VERCEL_URL in production)
    const callbackUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/webhook-callback`
      : 'http://localhost:3000/api/webhook-callback'

    // Send message and PDF URL to n8n webhook (PDF already uploaded to Blob by client)
    const webhookPayload = {
      message,
      sessionId,
      pdfUrl: pdfUrl || null,
      jobId,
      callbackUrl,
    }

    // Forward the request to n8n webhook with JSON payload (fire and forget)
    console.log('Sending request to webhook:', PDF_WEBHOOK_URL, webhookPayload)
    fetch(PDF_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    }).catch(error => {
      console.error('Error sending to n8n:', error)
    })

    // Return immediately with jobId
    return {
      error: null,
      jobId,
    }
  } catch (error) {
    console.error('Error in chat action:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)
    return {
      error: `Internal server error: ${errorMessage}`,
      jobId: null,
    }
  }
}
