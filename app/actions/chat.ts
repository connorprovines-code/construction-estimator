'use server'

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
        response: null,
      }
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return {
        error: 'Session ID is required and must be a string',
        response: null,
      }
    }

    // Send message and PDF URL to n8n webhook (PDF already uploaded to Blob by client)
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
        error: `Failed to process message: ${n8nResponse.status}`,
        details: errorText,
        response: null,
      }
    }

    // Try to parse JSON response
    let n8nData
    try {
      const responseText = await n8nResponse.text()
      console.log('n8n response:', responseText)
      n8nData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse n8n response:', parseError)
      return {
        error: 'Invalid response from webhook',
        response: null,
      }
    }

    // Return the response from n8n
    return {
      error: null,
      response: n8nData.response || n8nData.message || n8nData.output || 'No response from assistant',
    }
  } catch (error) {
    console.error('Error in chat action:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)
    return {
      error: `Internal server error: ${errorMessage}`,
      response: null,
    }
  }
}
