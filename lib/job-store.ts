// Simple in-memory store (upgrade to Vercel KV/Redis for production)
// Key: jobId, Value: { status, response, timestamp }
export const jobResults = new Map<string, any>()

// Cleanup old results after 1 hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    jobResults.forEach((result, jobId) => {
      if (result.timestamp < oneHourAgo) {
        jobResults.delete(jobId)
      }
    })
  }, 5 * 60 * 1000) // Run every 5 minutes
}
