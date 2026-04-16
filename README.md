# SocialHub - Modern Social Media Platform

A full-featured social media application built with Next.js, featuring user authentication, posts, interactions (likes/comments), and social features (follow, search, profiles).

## Features

### Phase 1: Authentication ✓
- JWT-based authentication system
- Secure password hashing with bcryptjs
- HttpOnly cookie storage
- User registration and login
- Protected routes with middleware

### Phase 2: Feed & Posts ✓
- Create, read, and delete posts
- Post feed with pagination
- Real-time post updates with SWR
- Image upload support
- Timestamp formatting (relative dates)

### Phase 3: Interactions ✓
- Like/unlike posts with optimistic updates
- Comment system with reply threads
- Real-time interaction counts
- Comment display and creation

### Phase 4: Social Features ✓
- Follow/unfollow users
- User profiles with stats (followers, following, posts)
- Global user search
- Explore page to discover users
- User bio and profile information

### Phase 5: Personalization ✓
- Edit profile name and bio
- Settings page for account management
- Secure logout functionality
- Profile management

### Phase 6: Polish & Deploy ✓
- Modern UI with design tokens
- Loading skeletons
- Error handling
- 404 page
- Responsive design
- Clean navigation

### Phase 7: Advanced Notifications ✓
- Real-time notification system with polling
- Notification bell with unread badge
- Mark notifications as read (individual and all)
- Notification types: likes, comments, follows, messages
- Notification history and clearing

### Phase 8: Direct Messaging ✓
- One-to-one private messaging
- Conversation list with last message preview
- Real-time message updates (2-3 second polling)
- Message read status tracking
- Individual conversation threads
- Real-time typing awareness

### Phase 9: Post Management & Comments ✓
- Edit posts after creation
- Delete comments (by author or post owner)
- Comment deletion with proper authorization
- Cascade deletion of related data

### Phase 10: Advanced Search & Hashtags ✓
- Full-text search for posts and users
- Hashtag support and trending hashtags
- Hashtag pages with related posts
- Search filtering by type (posts/users/all)
- Trending hashtags section

### Phase 11: Theme & Preferences ✓
- Light/dark/system theme toggle
- Theme persistence in user preferences
- Notification preference settings (likes, comments, follows, messages)
- Email notification toggle
- Settings page with all preferences

### Phase 12: Pagination & Infinite Scroll ✓
- Infinite scroll component with Intersection Observer
- Pagination hook for managing page loads
- Auto-load more content on scroll
- Loading indicators

### Phase 13: Bookmarks, Blocking & Reports ✓
- Save/bookmark posts for later
- Block users to prevent interaction
- View blocked users list
- Unblock functionality
- Report posts and users with reasons
- Report history tracking

### Phase 14: Activity Feed & Analytics ✓
- User activity feed grouped by date
- Analytics dashboard with engagement metrics
- Charts showing engagement over time
- Post performance summaries
- Follower growth tracking
- Analytics by week/month

## Tech Stack

- **Framework**: Next.js 16
- **Auth**: JWT with HttpOnly cookies
- **Password Hashing**: bcryptjs
- **Data Fetching**: SWR (Client-side caching with polling)
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS with custom design tokens
- **Validation**: Zod
- **Icons**: Lucide React
- **Charts**: Recharts for analytics
- **Database**: PostgreSQL via Neon (serverless, edge-ready)
- **Real-time**: Polling for notifications and messages (WebSocket ready)

## Project Structure

```
app/
├── (auth)/                 # Auth routes (login, register)
├── (app)/                  # Protected routes
│   ├── feed/              # Main feed page
│   ├── profile/[username]/ # User profiles
│   ├── explore/           # User discovery/search
│   ├── settings/          # Account settings with theme & preferences
│   ├── messages/          # Direct messaging
│   ├── messages/[userId]/ # Conversation with specific user
│   ├── search/            # Search results
│   ├── hashtag/[tag]/     # Hashtag page
│   ├── bookmarks/         # Saved posts
│   ├── blocked/           # Blocked users list
│   ├── activity/          # User activity feed
│   ├── analytics/         # Analytics dashboard
│   └── layout.tsx         # Protected layout with auth guard
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   ├── posts/             # Post management
│   ├── users/             # User endpoints
│   ├── notifications/     # Notification endpoints
│   ├── messages/          # Messaging endpoints
│   ├── comments/          # Comment management
│   ├── search/            # Search endpoints
│   ├── hashtags/          # Hashtag endpoints
│   └── reports/           # Report endpoints
└── page.tsx               # Root redirect

components/
├── navbar.tsx             # Main navigation with search
├── notification-bell.tsx   # Notification dropdown menu
├── search-bar.tsx         # Search bar component
├── post-card.tsx          # Post display with interactions
├── create-post.tsx        # Post creation form
├── post-edit-modal.tsx     # Post editing dialog
├── report-dialog.tsx       # Report form dialog
├── infinite-scroll.tsx     # Infinite scroll wrapper
├── skeleton.tsx           # Loading skeleton
└── ui/                    # shadcn/ui components

hooks/
├── use-auth.tsx           # Authentication context
├── use-posts.tsx          # Post management
├── use-interactions.tsx    # Likes and comments
├── use-notifications.tsx   # Notification management
├── use-messages.tsx       # Direct messaging
├── use-search.tsx         # Search and hashtags
├── use-preferences.tsx     # User preferences
└── use-pagination.tsx     # Pagination logic

lib/
├── auth.ts                # JWT utilities
├── db.ts                  # SQLite database layer
└── schemas.ts             # Zod validation schemas
```

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `GET /api/posts/[id]` - Get single post
- `DELETE /api/posts/[id]` - Delete post
- `POST /api/posts/[id]/likes` - Like post
- `DELETE /api/posts/[id]/likes` - Unlike post
- `GET /api/posts/[id]/comments` - Get comments
- `POST /api/posts/[id]/comments` - Add comment

### Users
- `GET /api/users/[username]` - Get user profile
- `GET /api/users/[username]/posts` - Get user's posts
- `POST /api/users/[username]/follow` - Follow user
- `DELETE /api/users/[username]/follow` - Unfollow user
- `GET /api/users/search?q=query` - Search users
- `POST /api/users/[username]/block` - Block user
- `DELETE /api/users/[username]/block` - Unblock user

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Mark all as read
- `PUT /api/notifications/[id]` - Mark single as read

### Messages
- `GET /api/messages` - Get conversations
- `POST /api/messages` - Send message
- `GET /api/messages/[userId]` - Get conversation with user

### Comments
- `DELETE /api/comments/[id]` - Delete comment

### Post Management
- `PUT /api/posts/[id]/edit` - Edit post

### Search & Hashtags
- `GET /api/search?q=query&type=all` - Search posts and users
- `GET /api/hashtags?trending=true` - Get trending hashtags
- `GET /api/hashtags?q=tag` - Search specific hashtag

### User Preferences
- `GET /api/auth/preferences` - Get user preferences
- `PUT /api/auth/preferences` - Update preferences (theme, notifications)

### Reports
- `POST /api/reports` - Submit report (post or user)

## Design Tokens

The app uses a custom color system with:
- **Primary**: Purple (oklch(0.42 0.15 300))
- **Background**: Light blue-grey (oklch(0.98 0.01 240))
- **Neutrals**: Grays for secondary elements
- **Dark Mode**: Complete dark mode support

## Future Enhancements

### Database Integration
Replace the SQLite database with:
- Supabase (PostgreSQL with built-in auth)
- Neon (Serverless PostgreSQL)
- PlanetScale (MySQL)

### Advanced Features
- Real-time WebSocket updates (instead of polling)
- Email notifications with templates
- Post sharing/retweets
- Media storage with Vercel Blob
- Image optimization with Next.js Image
- User mentions with autocomplete
- Advanced recommendation algorithm
- Video support for posts
- Live streaming capability
- User badges and verification
- Payment integration for premium features

### Performance
- Image optimization with Next.js Image
- Incremental Static Regeneration (ISR)
- Caching strategies
- Database query optimization

## Deployment

Deploy to Vercel with one click:

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

Environment variables needed:
- `JWT_SECRET` - Secret key for JWT signing

## Security Considerations

- Passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens stored in HttpOnly cookies
- CSRF protection enabled
- Input validation with Zod
- SQL injection prevention (parameterized queries when using database)
- Rate limiting (recommended for production)

## License

MIT
