# Social Media Manager

A comprehensive Next.js application for managing social media posts across multiple platforms with AI-powered content optimization. Built with NextAuth.js for secure OAuth 2.0 authentication, Twitter API v2, Facebook Graph API, and OpenAI integration.

## ✨ Features

### 🔐 **Multi-Platform Authentication**
- Twitter OAuth 2.0 authentication
- Facebook OAuth 2.0 authentication with page management
- Secure session handling with NextAuth.js

### 📝 **Content Management**
- Compose and post tweets directly from the app
- Post to Facebook pages with page selection
- Draft system for saving and managing unpublished content
- Real-time character counting for each platform

### 🤖 **AI-Powered Optimization**
- OpenAI integration for content optimization
- Platform-specific optimization (Twitter vs Facebook)
- Multiple tone options (Professional, Casual, Engaging, Informative)
- Character limit optimization and best practice suggestions

### 👤 **Profile Management**
- View Twitter profile information and metrics
- Facebook profile and page management
- Real-time follower/following statistics

### 🎨 **Modern UI**
- Responsive design with Tailwind CSS
- Platform switching interface
- Loading states and comprehensive error handling
- Clean, intuitive user experience

## Prerequisites

- Node.js 18+
- Twitter Developer Account
- Facebook Developer Account  
- OpenAI API Account

## Setup Instructions

### 1. Twitter App Setup
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new App
3. In App Settings → User authentication settings:
   - Enable OAuth 2.0
   - Type: Web App
   - Callback URL: `http://localhost:3000/api/auth/callback/twitter`
   - Website URL: `http://localhost:3000`
4. Note down your Client ID and Client Secret

### 2. Facebook App Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new App
3. Add Facebook Login product
4. In Facebook Login settings:
   - Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/callback/facebook`
5. Request permissions: `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`
6. Note down your App ID and App Secret

### 3. OpenAI Setup
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Note down your API key

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
# Twitter Configuration
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Facebook Configuration
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# NextAuth Configuration
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

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints for Twitter and Facebook

### Twitter Integration
- `GET /api/twitter/me` - Get authenticated user's Twitter profile
- `POST /api/twitter/post` - Post a tweet

### Facebook Integration
- `GET /api/facebook/me` - Get authenticated user's Facebook profile and pages
- `POST /api/facebook/post` - Post to a Facebook page

### Draft Management
- `GET /api/drafts` - Get all drafts for the user
- `POST /api/drafts` - Create a new draft
- `PUT /api/drafts` - Update an existing draft
- `DELETE /api/drafts?id={draftId}` - Delete a draft

### AI Optimization
- `POST /api/optimize` - Optimize content for specific platform

### System Health
- `GET /api/health` - Health check and service status

## Usage Examples

### Post a Tweet
```javascript
const response = await fetch('/api/twitter/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello from my app!' })
})
```

### Post to Facebook Page
```javascript
const response = await fetch('/api/facebook/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello Facebook!',
    pageId: 'your_page_id',
    pageAccessToken: 'page_access_token'
  })
})
```

### Optimize Content with AI
```javascript
const response = await fetch('/api/optimize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Original content here',
    platform: 'twitter',
    tone: 'engaging'
  })
})
```

## Project Structure

```
/social-manager
├── pages/
│   ├── index.tsx                    # Enhanced dashboard with multi-platform support
│   ├── _app.tsx                     # App wrapper with SessionProvider
│   ├── auth/
│   │   └── error.tsx                # Authentication error handling
│   └── api/
│       ├── health.ts                # System health monitoring
│       ├── optimize.ts              # AI content optimization
│       ├── drafts/
│       │   └── index.ts             # Draft management CRUD
│       ├── auth/
│       │   └── [...nextauth].ts     # Multi-provider NextAuth configuration
│       ├── twitter/
│       │   ├── me.ts                # Twitter user profile
│       │   └── post.ts              # Twitter posting
│       └── facebook/
│           ├── me.ts                # Facebook user profile and pages
│           └── post.ts              # Facebook page posting
├── src/
│   ├── components/
│   │   ├── Layout.tsx               # Main layout component
│   │   └── AuthButton.tsx           # Multi-provider authentication
│   ├── lib/
│   │   ├── auth-options.ts          # NextAuth provider setup
│   │   ├── twitter.ts               # Twitter API client class
│   │   └── facebook.ts              # Facebook API client class
│   ├── styles/
│   │   └── globals.css              # Global styles with Tailwind
│   └── types/
│       └── index.ts                 # Comprehensive TypeScript definitions
├── .env.local                       # Environment variables
├── next.config.ts                   # Next.js configuration
├── package.json                     # Dependencies and scripts
└── README.md                        # This file
```

## Key Features Walkthrough

### 🚀 **Multi-Platform Posting**
1. **Authentication**: Choose between Twitter or Facebook login
2. **Platform Selection**: Switch between platforms in the interface
3. **Smart Posting**: Platform-specific character limits and validation
4. **Page Management**: Select specific Facebook pages to post to

### 🧠 **AI Content Optimization**
1. **Content Analysis**: AI analyzes your content for the selected platform
2. **Tone Adjustment**: Choose from multiple tone options
3. **Platform Optimization**: Automatically adjust for Twitter (280 chars) or Facebook (2000 chars recommended)
4. **Best Practices**: AI applies platform-specific best practices

### 📋 **Draft Management**
1. **Save Drafts**: Save content for later editing and publishing
2. **Edit Anytime**: Modify saved drafts before posting
3. **Platform Assignment**: Assign drafts to specific platforms
4. **Quick Access**: Easy draft management interface

## Security Features

- OAuth 2.0 authentication (no password storage)
- Session-based API protection
- Input validation and sanitization
- CSRF protection via NextAuth.js
- Secure environment variable handling
- Rate limiting considerations

## Production Deployment

1. Set up environment variables in your hosting platform
2. Update `NEXTAUTH_URL` to your production domain
3. Update Twitter and Facebook app callback URLs to match production domain
4. Configure OpenAI API key for production use
5. Build and deploy:

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**: 
   - Check app configurations and callback URLs
   - Verify environment variables are set correctly
   - Ensure OAuth apps have correct permissions

2. **API Errors**: 
   - Verify all API keys are configured
   - Check service quotas and rate limits
   - Visit `/api/health` to check service status

3. **OpenAI Issues**:
   - Verify API key is valid and has sufficient credits
   - Check for quota limitations

### Health Check

Visit `/api/health` to check the status of all services:
- ✅ Twitter API configuration
- ✅ Facebook API configuration  
- ✅ OpenAI API configuration
- ✅ NextAuth configuration

## Future Enhancements

### Potential Features:
- **Scheduled Posts**: Queue content for future posting
- **Analytics Dashboard**: Post performance metrics
- **Thread Support**: Create Twitter threads
- **Media Upload**: Support for images and videos
- **Multi-Account**: Manage multiple accounts per platform
- **Team Collaboration**: Share drafts and collaborate

### Technical Improvements:
- Database integration for persistent draft storage
- Advanced rate limiting
- Comprehensive error logging
- CDN setup for static assets
- Performance monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

---

**🎉 Multi-Platform Social Media Manager with AI Optimization - Complete & Ready for Use!**

Now supporting Twitter & Facebook with intelligent content optimization powered by OpenAI.
