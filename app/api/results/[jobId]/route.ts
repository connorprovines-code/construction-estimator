import { NextResponse } from 'next/server'
import { jobResults } from '../../webhook-callback/route'

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  const jobId = params.jobId

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
  }

  const result = jobResults.get(jobId)

  if (!result) {
    // Job still processing or doesn't exist
    return NextResponse.json({ status: 'processing' })
  }

  return NextResponse.json(result)
}
