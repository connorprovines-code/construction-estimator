import { NextResponse } from 'next/server'

// Simple in-memory store (upgrade to Vercel KV/Redis for production)
// Key: jobId, Value: { status, response, timestamp }
export const jobResults = new Map<string, any>()

// Cleanup old results after 1 hour
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  for (const [jobId, result] of jobResults.entries()) {
    if (result.timestamp < oneHourAgo) {
      jobResults.delete(jobId)
    }
  }
}, 5 * 60 * 1000) // Run every 5 minutes

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { jobId, response, error } = body

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    // Store the result
    jobResults.set(jobId, {
      status: error ? 'error' : 'completed',
      response,
      error,
      timestamp: Date.now(),
    })

    console.log(`Job ${jobId} completed:`, { response, error })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in webhook callback:', error)
    return NextResponse.json({ error: 'Failed to process callback' }, { status: 500 })
  }
}
