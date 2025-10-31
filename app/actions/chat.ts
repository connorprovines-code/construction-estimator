'use server'

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

    // Create form data for n8n webhook
    const webhookFormData = new FormData()
    webhookFormData.append('message', message)
    webhookFormData.append('sessionId', sessionId)

    if (pdfFile) {
      console.log('Processing PDF file:', pdfFile.name, 'Size:', pdfFile.size, 'bytes')
      // Convert File to Blob with proper metadata for serverless compatibility
      const pdfBuffer = await pdfFile.arrayBuffer()
      const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' })
      webhookFormData.append('pdf', pdfBlob, pdfFile.name)
      console.log('PDF converted to Blob successfully')
    }

    // Forward the request to n8n PDF webhook
    console.log('Sending request to webhook:', PDF_WEBHOOK_URL)
    const n8nResponse = await fetch(PDF_WEBHOOK_URL, {
      method: 'POST',
      body: webhookFormData,
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
