import { NextResponse } from 'next/server'
import { jobResults } from '@/lib/job-store'

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
