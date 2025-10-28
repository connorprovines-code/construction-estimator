# Construction Estimator AI

A professional construction cost estimation chat interface powered by AI, built with Next.js 14 and deployed on Vercel.

## Features

- Real-time chat interface for construction cost estimates
- Session-based conversations with state management via n8n
- Clean, modern UI with responsive design
- Mobile-friendly interface
- Professional blue accent color scheme

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: n8n webhook integration
- **Deployment**: Vercel

## Project Structure

```
construction-estimator/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       # API endpoint for chat
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main chat interface
├── .env.local                 # Environment variables (not in git)
├── .env.example               # Example environment variables
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with your n8n webhook URL:

```env
N8N_WEBHOOK_URL=your_n8n_webhook_url_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Run deployment:

```bash
vercel
```

3. Add environment variable in Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add `N8N_WEBHOOK_URL` with your webhook URL

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add the `N8N_WEBHOOK_URL` environment variable
4. Deploy

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `N8N_WEBHOOK_URL` | The n8n webhook URL for chat processing | Yes |

## How It Works

1. **Session Management**: Each user gets a unique session ID (UUID) generated on the client side
2. **Message Flow**:
   - User sends a message through the chat interface
   - Frontend sends POST request to `/api/chat` with message and sessionId
   - API endpoint forwards the request to n8n webhook
   - n8n processes the message (manages state in Redis, interacts with Claude)
   - n8n returns the assistant's response
   - Frontend displays the response in the chat

## API Endpoint

### POST /api/chat

**Request Body:**
```json
{
  "message": "string",
  "sessionId": "string"
}
```

**Response:**
```json
{
  "response": "string"
}
```

## License

This project is private and proprietary.
