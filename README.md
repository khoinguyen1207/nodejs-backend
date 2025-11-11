<h1 align="center">NodeJS Backend - Twitter Clone</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white"/> 
</p>

A **production-ready Twitter-like social media backend** built with modern Node.js technologies, featuring comprehensive authentication, media handling, real-time capabilities, and cloud deployment.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Development Guide](#-development-guide)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### Core Functionality

- 🔐 **Multi-tier Authentication** - JWT (access + refresh tokens) & Google OAuth 2.0
- 👥 **User Management** - Registration, profile management, email verification, password reset
- 🐦 **Tweets** - Create, view, like, comment, retweet, quote tweet
- 📱 **Social Features** - Follow/unfollow users, Twitter Circle (private audience)
- 🔖 **Bookmarks** - Save and manage favorite tweets
- 🔍 **Advanced Search** - Full-text search with filters (media type, followed users only)
- 📰 **News Feed** - Personalized feed from followed users

### Media & Performance

- 📸 **Image Upload** - Auto-resize to JPEG, upload to AWS S3 (max 4 images, 500KB each)
- 🎥 **Video Streaming** - HTTP range requests for progressive video playback
- ☁️ **Cloud Storage** - AWS S3 integration with automatic local cleanup
- ⚡ **Rate Limiting** - 100 requests/minute per IP
- 📊 **View Tracking** - Separate counters for guest/authenticated user views

### Developer Experience

- 🛡️ **Type Safety** - Full TypeScript with strict mode
- ✅ **Environment Validation** - Zod schema validation for all env variables
- 📝 **Structured Logging** - Winston with daily log rotation (14-day retention)
- 🔍 **Request Logging** - Automatic HTTP request/response logging
- 🚨 **Error Handling** - Custom error classes with standardized JSON responses
- 🔒 **Security** - Helmet.js security headers, CORS configuration

## 💻 Tech Stack

### Core

- **Runtime**: Node.js 24
- **Language**: TypeScript 5.4
- **Framework**: Express.js 4.19
- **Database**: MongoDB (Atlas) with native driver

### Authentication & Security

- **JWT**: jsonwebtoken for token-based auth
- **OAuth**: google-auth-library for Google Sign-In
- **Security**: helmet, cors, express-rate-limit
- **Password**: SHA-256 hashing with custom secret

### Media Processing

- **Image**: sharp (resize, convert to JPEG)
- **Video**: formidable (upload), fs streams (HTTP range requests)
- **Storage**: AWS S3 (@aws-sdk/client-s3, @aws-sdk/lib-storage)

### Validation & Error Handling

- **Validation**: express-validator with custom wrappers
- **Schema**: Zod for environment variable validation
- **Logging**: winston, winston-daily-rotate-file

### Development Tools

- **Development**: nodemon, ts-node, tsconfig-paths
- **Build**: tsc, tsc-alias (resolve path aliases)
- **Code Quality**: ESLint, Prettier
- **Deployment**: Docker, PM2 (ecosystem.config.js)

### Other Libraries

- **Email**: AWS SES (@aws-sdk/client-ses)
- **Utils**: lodash

## 🏗 Architecture

### Layered Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                      Express.js Routes                       │
│  (src/routes/*.routes.ts - Define endpoints & middleware)   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Middleware Layer                          │
│  • Authentication (JWT validation, OAuth)                   │
│  • Authorization (verified user check)                      │
│  • Validation (express-validator + custom schemas)         │
│  • Error Handling (wrapRequestHandler)                      │
│  • Logging (request/response)                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      Controllers                             │
│  (src/controllers/*.controllers.ts)                         │
│  • Extract request data (body, params, decoded tokens)      │
│  • Call service methods                                      │
│  • Format JSON responses                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Business Logic (Services)                 │
│  (src/services/*.services.ts)                               │
│  • Database operations                                       │
│  • Business rules enforcement                                │
│  • Third-party integrations (AWS, Google)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     Database Layer                           │
│  • MongoDB collections (via singleton databaseService)      │
│  • Schema classes with constructors                          │
│  • Automatic indexing on startup                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Patterns

1. **Singleton Services** - All services exported as instances (e.g., `databaseService`, `userService`)
2. **Schema Constructors** - MongoDB document classes handle defaults and type conversions
3. **Custom Error Classes** - Extend `DefaultError` for consistent error responses
4. **Middleware Chaining** - Validators → Auth → Business Logic → Error Handler
5. **Path Aliases** - Use `~/` prefix for all imports (configured in tsconfig.json)

### Data Flow Example (Create Tweet)

```typescript
// 1. Route definition
tweetsRouter.post('/',
  accessTokenValidator,           // Decode JWT, attach to req.decoded_authorization
  verifiedUserValidator,          // Check user is verified
  createTweetValidator,           // Validate tweet data
  wrapRequestHandler(createTweetController)  // Handle errors
)

// 2. Controller extracts data
const { user_id } = req.decoded_authorization as TokenPayload
const result = await tweetService.createTweet(user_id, req.body)

// 3. Service handles business logic
async createTweet(user_id, body) {
  const hashtags = await this.checkAndCreateHashtags(body.hashtags)  // Upsert hashtags
  const result = await databaseService.tweets.insertOne(
    new Tweet({ ...body, user_id: new ObjectId(user_id), hashtags })  // Constructor handles defaults
  )
  return await databaseService.tweets.findOne({ _id: result.insertedId })
}
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20+ (v24 recommended)
- **MongoDB**: Atlas account or local MongoDB instance
- **AWS Account**: For S3 and SES services
- **Google OAuth**: Client ID and Secret from Google Cloud Console

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nodejs-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in all required values:

   ```bash
   # Database
   DB_USERNAME=your_mongodb_username
   DB_PASSWORD=your_mongodb_password
   DB_NAME=twitter-dev

   # Server
   PORT=4000
   HOST=http://localhost:4000
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development

   # JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   PASSWORD_SECRET_KEY=your_secret_key
   ACCESS_TOKEN_SECRET_KEY=your_access_token_secret
   REFRESH_TOKEN_SECRET_KEY=your_refresh_token_secret
   EMAIL_VERIFICATION_SECRET_KEY=your_email_verification_secret
   FORGOT_PASSWORD_SECRET_KEY=your_forgot_password_secret

   # Token Expiration
   ACCESS_TOKEN_EXPIRES_IN=1h
   REFRESH_TOKEN_EXPIRES_IN=7d

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/login/oauth

   # AWS
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=ap-southeast-1
   SES_FROM_ADDRESS=your_verified_ses_email@example.com
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Server will start on `http://localhost:4000` with hot-reload enabled.

### Verify Installation

Once started, you should see:

```
✅ You successfully connected to MongoDB!
Server is running on port 4000
```

Database indexes will be created automatically on first startup.

## 📁 Project Structure

```
nodejs-backend/
├── src/
│   ├── index.ts                    # Application entry point, middleware setup
│   ├── type.d.ts                   # Global TypeScript type declarations
│   │
│   ├── constants/                  # Configuration and constants
│   │   ├── config.ts               # Environment variables with Zod validation
│   │   ├── dir.ts                  # File system paths
│   │   ├── httpStatus.ts           # HTTP status code constants
│   │   ├── logging.ts              # Winston logger configuration
│   │   └── regex.ts                # Regex patterns for validation
│   │
│   ├── routes/                     # Express route definitions
│   │   ├── auths.routes.ts         # /auths - login, register, OAuth, refresh token
│   │   ├── users.routes.ts         # /users - profile, follow, verify email
│   │   ├── tweets.routes.ts        # /tweets - create, view, like, comments
│   │   ├── bookmarks.routes.ts     # /bookmarks - save/unsave tweets
│   │   ├── medias.routes.ts        # /medias - upload images/videos
│   │   ├── statics.routes.ts       # /statics - serve uploaded files
│   │   └── searchs.routes.ts       # /searchs - search tweets
│   │
│   ├── controllers/                # Request handlers
│   │   ├── auths.controllers.ts
│   │   ├── users.controllers.ts
│   │   ├── tweets.controllers.ts
│   │   ├── bookmarks.controllers.ts
│   │   ├── medias.controllers.ts
│   │   ├── statics.controllers.ts
│   │   └── searchs.controllers.ts
│   │
│   ├── services/                   # Business logic layer
│   │   ├── database.services.ts    # MongoDB connection & collection access
│   │   ├── auths.services.ts       # Authentication logic
│   │   ├── users.services.ts       # User management
│   │   ├── tweets.services.ts      # Tweet operations, hashtag handling
│   │   ├── bookmarks.services.ts   # Bookmark operations
│   │   ├── medias.services.ts      # File upload, Sharp processing, S3 upload
│   │   └── searchs.services.ts     # Full-text search with aggregations
│   │
│   ├── middlewares/                # Express middleware
│   │   ├── auth.middlewares.ts     # JWT validation, refresh token, verified user check
│   │   ├── users.middlewares.ts    # User-specific validators
│   │   ├── tweet.middlewares.ts    # Tweet validators, audience permission check
│   │   ├── search.middlewares.ts   # Search query validators
│   │   ├── error.middlewares.ts    # Global error handler
│   │   └── logging.middlewares.ts  # HTTP request/response logger
│   │
│   ├── models/
│   │   ├── schemas/                # MongoDB document classes
│   │   │   ├── User.schema.ts      # User document with verification status
│   │   │   ├── Tweet.schema.ts     # Tweet with type, audience, mentions, medias
│   │   │   ├── Hashtag.schema.ts   # Hashtag with name
│   │   │   ├── Follower.schema.ts  # User relationships
│   │   │   ├── Bookmark.schema.ts  # User bookmarks
│   │   │   ├── Like.schema.ts      # Tweet likes
│   │   │   └── RefreshToken.schema.ts  # Active refresh tokens
│   │   │
│   │   └── requests/               # Request body TypeScript interfaces
│   │       ├── Auth.requests.ts
│   │       ├── User.request.ts
│   │       ├── Tweet.requests.ts
│   │       ├── Bookmark.requests.ts
│   │       ├── Search.requests.ts
│   │       └── Util.requests.ts    # Shared types (Pagination)
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── enums.ts                # Enums (UserVerifyStatus, TweetType, MediaType, etc.)
│   │   ├── jwt.ts                  # JWT payload interfaces
│   │   └── medias.ts               # Media type interfaces
│   │
│   ├── utils/                      # Utility functions
│   │   ├── crypto.ts               # SHA-256 password hashing
│   │   ├── jwt.ts                  # JWT sign/verify wrappers
│   │   ├── validation.ts           # express-validator wrapper
│   │   ├── error-handler.ts        # Custom error classes, wrapRequestHandler
│   │   ├── file.ts                 # formidable upload handlers
│   │   ├── s3.ts                   # AWS S3 upload function
│   │   ├── email.ts                # AWS SES email sending
│   │   ├── helper.ts               # Generic helper functions
│   │   └── oauth.ts                # Google OAuth2 client
│   │
│   └── templates/
│       └── verify-email.html       # Email verification template
│
├── uploads/                        # Local file storage (temporary)
│   ├── images/
│   │   └── temp/                   # Temp storage before S3 upload
│   └── videos/
│
├── logs/                           # Winston log files (YYYY-MM-DD.log)
│
├── dist/                           # Compiled JavaScript output
│
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Environment template
├── tsconfig.json                   # TypeScript configuration
├── nodemon.json                    # Nodemon configuration
├── ecosystem.config.js             # PM2 configuration
├── Dockerfile                      # Docker build instructions
└── package.json                    # Dependencies and scripts
```

## 🔌 API Endpoints

### Authentication (`/auths`)

- `POST /auths/register` - Create new account
- `POST /auths/login` - Login with email/password
- `POST /auths/logout` - Logout (invalidate refresh token)
- `POST /auths/refresh-token` - Get new access token
- `POST /auths/oauth/google` - Google OAuth login/register

### Users (`/users`)

- `GET /users/profile` - Get own profile (requires auth)
- `PATCH /users/profile` - Update profile (verified users only)
- `GET /users/:username` - Get user info by username
- `POST /users/verify-email` - Verify email with token
- `POST /users/send-verify-email` - Resend verification email
- `POST /users/forgot-password` - Request password reset
- `POST /users/reset-password` - Reset password with token
- `PUT /users/change-password` - Change password (requires auth)
- `POST /users/follow` - Follow a user
- `DELETE /users/follow/:user_id` - Unfollow a user

### Tweets (`/tweets`)

- `POST /tweets` - Create new tweet (verified users only)
- `GET /tweets/detail/:tweet_id` - Get tweet details with permission check
- `GET /tweets/children/:tweet_id` - Get tweet replies/quotes (paginated)
- `GET /tweets/new-feeds` - Get personalized news feed
- `POST /tweets/like` - Like a tweet
- `DELETE /tweets/unlike/:tweet_id` - Unlike a tweet

### Bookmarks (`/bookmarks`)

- `POST /bookmarks` - Bookmark a tweet
- `DELETE /bookmarks/tweets/:tweet_id` - Remove bookmark
- `GET /bookmarks` - Get user's bookmarks (paginated)

### Media (`/medias`)

- `POST /medias/upload-images` - Upload images (max 4, 500KB each)
- `POST /medias/upload-videos` - Upload video (max 1, 50MB)

### Static Files (`/statics`)

- `GET /statics/images/:name` - Serve image file
- `GET /statics/videos/:name` - Stream video with range support

### Search (`/searchs`)

- `GET /searchs` - Search tweets with filters (content, media_type, people_follow, pagination)

## 🛠 Development Guide

### Available Scripts

```bash
# Development
npm run dev              # Start with nodemon (hot reload)

# Building
npm run build            # Clean dist/ → compile TypeScript → resolve aliases

# Production
npm start                # Run compiled code (node dist/index.js)

# Code Quality
npm run lint             # Check for linting errors
npm run lint:fix         # Auto-fix linting issues
npm run prettier         # Check code formatting
npm run prettier:fix     # Auto-format code
```

### Development Workflow

1. **Create a new feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes following patterns**

   - Use `~/` imports (not relative paths)
   - Wrap controllers with `wrapRequestHandler()`
   - Use custom error classes (`BadRequestError`, `NotFoundError`, etc.)
   - Validate input with express-validator + `validate()` wrapper
   - Access user context via `req.decoded_authorization.user_id`

3. **Test locally**

   ```bash
   npm run dev
   # Test endpoints with Postman/Thunder Client
   ```

4. **Run linting and formatting**

   ```bash
   npm run lint:fix
   npm run prettier:fix
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

### Key Conventions

#### Error Handling

Always wrap async controllers:

```typescript
// ✅ Correct
tweetsRouter.post("/", wrapRequestHandler(createTweetController))

// ❌ Wrong - errors won't be caught
tweetsRouter.post("/", createTweetController)
```

#### Validation Pattern

```typescript
// In middleware file
export const createTweetValidator = validate(
  checkSchema(
    {
      content: {
        isString: true,
        isLength: { options: { min: 1, max: 280 } },
      },
    },
    ["body"],
  ),
)

// In route file
tweetsRouter.post("/", createTweetValidator, wrapRequestHandler(controller))
```

#### Service Pattern

```typescript
// Export as singleton instance
class TweetService {
  async createTweet(user_id: string, body: CreateTweetReqBody) {
    // Business logic here
  }
}

const tweetService = new TweetService()
export default tweetService
```

### Common Pitfalls

1. **Don't use `process.env` directly** → Use `envConfig` from `~/constants/config`
2. **Don't forget `verifiedUserValidator`** → Most actions require verified users
3. **Remember type conversion** → Request params are strings, convert to `ObjectId` for database
4. **Clean up files** → Always `await fsPromises.unlink()` after S3 upload
5. **Check token expiry** → Use appropriate token type for validation

### Debugging

Enable detailed logging:

```typescript
// In src/index.ts or specific files
import { logger } from "~/constants/logging"

logger.info("Debug message", { additional: "data" })
logger.error("Error occurred", error)
```

Logs are stored in `logs/YYYY-MM-DD.log` with 14-day retention.

## 🐳 Deployment

### Docker Deployment

1. **Build Docker image**

   ```bash
   docker build -t nodejs-backend .
   ```

2. **Run container**
   ```bash
   docker run -p 4000:4000 --env-file .env nodejs-backend
   ```

### PM2 Deployment (Production)

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Start with PM2**

   ```bash
   pm2 start ecosystem.config.js --env production
   ```

3. **Monitor**
   ```bash
   pm2 status
   pm2 logs twitter-clone
   pm2 monit
   ```

### Environment Variables for Production

Update `.env` for production:

```bash
NODE_ENV=production
HOST=https://your-domain.com
CLIENT_URL=https://your-frontend-domain.com
```

## 📜 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Follow the coding standards**

   - Use TypeScript strict mode
   - Follow existing patterns (services, controllers, validators)
   - Write meaningful commit messages
   - Run linting before committing

4. **Test your changes**

   - Test all affected endpoints
   - Verify no console errors
   - Check logs for issues

5. **Submit a pull request**
   - Describe changes clearly
   - Reference any related issues
   - Wait for code review

### Code Style

- **Formatting**: Prettier (automatic formatting)
- **Linting**: ESLint with TypeScript rules
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Comments**: Use JSDoc for complex functions

## 📄 Author & License

**Developed by**: Khoi Nguyen  
**Email**: [khoinguyentpvl@gmail.com](mailto:khoinguyentpvl@gmail.com)  
**License**: ISC

---

<p align="center">Made with ❤️ using Node.js, TypeScript, and MongoDB</p>
