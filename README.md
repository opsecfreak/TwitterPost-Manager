# Social Media Manager

A Next.js application for managing social media posts with Twitter integration. Built with NextAuth.js for secure OAuth 2.0 authentication and the Twitter API v2.

## Features

- 🔐 Secure Twitter OAuth 2.0 authentication
- 📝 Compose and post tweets directly from the app
- 👤 View Twitter profile information and metrics
- 🎨 Modern, responsive UI with Tailwind CSS
- 🛡️ Type-safe with TypeScript
- 🔍 API health monitoring

## Prerequisites

- Node.js 18+ 
- A Twitter Developer Account
- Twitter App with OAuth 2.0 enabled

## Twitter App Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new App
3. In App Settings → User authentication settings:
   - Enable OAuth 2.0
   - Type: Web App
   - Callback URL: `http://localhost:3000/api/auth/callback/twitter`
   - Website URL: `http://localhost:3000`
4. Note down your Client ID and Client Secret

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd social-manager
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file in the root directory:
```env
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

4. Generate a NextAuth secret:
```bash
openssl rand -base64 32
```

## Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## API Endpoints

- `GET /api/health` - Health check and service status
- `GET /api/twitter/me` - Get authenticated user's Twitter profile
- `POST /api/twitter/post` - Post a tweet

### Example API Usage

Post a tweet:
```javascript
const response = await fetch('/api/twitter/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello from my app!' })
})
```

## Project Structure

```
/social-manager
├── pages/
│   ├── index.tsx                    # Main dashboard
│   ├── _app.tsx                     # App wrapper with SessionProvider
│   ├── auth/
│   │   └── error.tsx                # Authentication error page
│   └── api/
│       ├── health.ts                # Health check endpoint
│       ├── auth/
│       │   └── [...nextauth].ts     # NextAuth configuration
│       └── twitter/
│           ├── me.ts                # Get user profile
│           └── post.ts              # Post tweets
├── src/
│   ├── components/
│   │   ├── Layout.tsx               # Page layout wrapper
│   │   └── AuthButton.tsx           # Authentication button
│   ├── lib/
│   │   ├── auth-options.ts          # NextAuth configuration
│   │   └── twitter.ts               # Twitter API client
│   ├── styles/
│   │   └── globals.css              # Global styles
│   └── types/
│       └── index.ts                 # TypeScript type definitions
├── .env.local                       # Environment variables
├── next.config.ts                   # Next.js configuration
└── package.json
```

## Security Features

- OAuth 2.0 authentication flow
- Secure token handling with NextAuth.js
- API route protection with session validation
- Input validation and sanitization
- Error handling and user feedback

## Production Deployment

1. Set up environment variables in your hosting platform
2. Update `NEXTAUTH_URL` to your production domain
3. Update Twitter app callback URLs to match production domain
4. Build and deploy:

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **Authentication Error**: Check Twitter app configuration and callback URLs
2. **API Errors**: Verify environment variables are set correctly
3. **Build Errors**: Ensure all dependencies are installed with `npm install`

### Health Check

Visit `/api/health` to check service status and configuration.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
