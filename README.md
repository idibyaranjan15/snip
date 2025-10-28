# Shared Wall - Minimalist Real-Time Collaborative Space

A **zero-auth**, **community-shared wall** for posting text and images — like a lightweight collaborative space where college friends can drop answers, notes, and screenshots.

## Features

- **Zero Authentication**: No sign-up, no user tracking, no cookies, no local storage
- **Text & Image Posts**:
  - Paste text with full **Markdown support** and **syntax highlighting** for code
  - Upload multiple images (`jpg`, `jpeg`, `png`, `gif`, `svg`, `heic`) up to 100MB each
  - Mix both text and images in a single post
- **Real-Time Updates**: See new posts automatically (5-second polling)
- **Live Countdowns**: View expiry timers for each post (e.g., "expires in 1h 47m 23s")
- **Copy & Delete**: Copy text directly from posts, delete any post (permissionless)
- **Auto-Expiry**: All posts automatically delete after **12 hours** from both MongoDB and Blob storage
- **Dark & Minimal UI**: Responsive design with theme support

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose (TTL indexes for auto-expiry)
- **Storage**: Vercel Blob for image hosting
- **Markdown**: react-markdown, remark-gfm
- **Syntax Highlighting**: react-syntax-highlighter with Prism (VS Code Dark+/One Light themes, line numbers)
- **UI Components**: Radix UI primitives, Lucide icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (MongoDB Atlas recommended)
- Vercel account (for Blob storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd satoshi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   # MongoDB Connection String
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

   # Vercel Blob Storage Token
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXXXXX
   ```

   **Get MongoDB URI**: Sign up at [MongoDB Atlas](https://cloud.mongodb.com/), create a cluster, and get your connection string.

   **Get Vercel Blob Token**:
   - Sign up at [Vercel](https://vercel.com)
   - Go to Dashboard → Storage → Blob
   - Create a new Blob store and copy the token

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

3. **Add Environment Variables**
   - In Vercel project settings, add:
     - `MONGODB_URI`
     - `BLOB_READ_WRITE_TOKEN`

4. **Deploy**
   - Vercel will automatically deploy your app
   - The cron job for cleanup will run hourly (configured in `vercel.json`)

## Project Structure

```
satoshi/
├── app/
│   ├── api/
│   │   ├── posts/
│   │   │   ├── route.ts          # GET (fetch all), POST (create)
│   │   │   └── [id]/route.ts     # DELETE (delete post)
│   │   └── cron/
│   │       └── cleanup/route.ts  # Cleanup expired posts (cron job)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Wall.tsx                  # Main wall component with form
│   ├── PostCard.tsx              # Individual post display
│   └── ui/                       # Shadcn UI components
├── lib/
│   ├── mongodb.ts                # MongoDB connection
│   ├── models/
│   │   └── Post.ts               # Post schema
│   └── utils.ts
├── vercel.json                   # Cron job configuration
└── .env.example
```

## API Routes

### GET `/api/posts`
Fetch all non-expired posts in reverse chronological order.

**Response:**
```json
{
  "posts": [
    {
      "_id": "...",
      "text": "Sample markdown text",
      "images": ["https://blob.url/image.jpg"],
      "createdAt": "2025-10-28T10:00:00Z",
      "expiresAt": "2025-10-28T22:00:00Z"
    }
  ]
}
```

### POST `/api/posts`
Create a new post with text and/or images.

**Request:** `multipart/form-data`
- `text` (optional): Text content (Markdown supported)
- `images` (optional): One or more image files

**Response:**
```json
{
  "post": {
    "_id": "...",
    "text": "...",
    "images": ["..."],
    "createdAt": "...",
    "expiresAt": "..."
  }
}
```

### DELETE `/api/posts/[id]`
Delete a post by ID. Also deletes associated images from Blob storage.

**Response:**
```json
{
  "message": "Post deleted successfully"
}
```

### GET `/api/cron/cleanup`
Cleanup cron job (runs hourly via Vercel Cron). Deletes expired posts and their images.

**Response:**
```json
{
  "message": "Cleanup completed",
  "postsDeleted": 5,
  "imagesDeleted": 8
}
```

## How It Works

### Auto-Expiry System

1. **TTL Index**: MongoDB automatically deletes documents after `expiresAt` using TTL indexes
2. **Cron Job**: Hourly cleanup job (`/api/cron/cleanup`) removes expired posts and their Blob images
3. **Client-Side Filter**: API only returns posts where `expiresAt > now`

### Real-Time Updates

- Client polls `/api/posts` every 5 seconds
- New posts appear automatically without page refresh
- Countdown timers update every second

### Image Handling

- Images uploaded via `multipart/form-data`
- Stored in Vercel Blob with public access
- URLs saved in MongoDB
- Deleted from Blob when post expires or is manually deleted

## Markdown & Code Highlighting

Posts support GitHub Flavored Markdown with beautiful syntax highlighting powered by react-syntax-highlighter:

### Features
- **Headers**: `# H1`, `## H2`, etc.
- **Code blocks**: ` ```javascript` with language-specific highlighting + line numbers
- **Inline code**: `` `code` ``
- **Lists**: Ordered and unordered
- **Links**: `[text](url)`
- **Images**: `![alt](url)` (rendered inline)
- **Tables**: GitHub-style tables
- **Blockquotes**: `> quote`

### Code Highlighting
- **100+ languages** supported (JavaScript, Python, TypeScript, SQL, Bash, etc.)
- **Line numbers** for better code readability
- **Theme-aware**: Automatically switches between VS Code Dark+ (dark mode) and One Light (light mode)
- **Copy-friendly**: Line numbers are non-selectable for easy copying

**See SYNTAX_EXAMPLES.md** for examples you can copy and paste to test!

## Customization

### Change Expiry Duration

Edit `lib/models/Post.ts`:
```typescript
expiresAt: {
  type: Date,
  default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  index: true,
}
```

### Change Polling Interval

Edit `components/Wall.tsx`:
```typescript
// Poll every 10 seconds instead of 5
const interval = setInterval(fetchPosts, 10000);
```

### Adjust Max File Size

Edit `app/api/posts/route.ts`:
```typescript
if (file.size > 50 * 1024 * 1024) { // 50MB instead of 100MB
  // ...
}
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure your IP is whitelisted in MongoDB Atlas
- Check that your connection string is correct
- Verify database user has read/write permissions

### Vercel Blob Upload Failures
- Confirm `BLOB_READ_WRITE_TOKEN` is set correctly
- Check Vercel Blob quota hasn't been exceeded
- Ensure file types are valid

### Cron Job Not Running
- Verify `vercel.json` is in the root directory
- Cron jobs only work in production on Vercel (not in development)
- Check Vercel deployment logs

## License

MIT

## Contributing

Pull requests welcome! Feel free to open issues for bugs or feature requests.
