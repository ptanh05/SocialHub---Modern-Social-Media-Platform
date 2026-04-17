// Server-only database layer using Neon PostgreSQL.
// Must NOT be imported from client components — use the API routes instead.

import { neon } from '@neondatabase/serverless';

function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(databaseUrl);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function row<T>(raw: Record<string, unknown> | null): T | undefined {
  if (!raw) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === 'read' || k.startsWith('notif_') || k === 'email_notifications' || k === 'is_verified') {
      out[k] = Boolean(v);
    } else if (typeof v === 'number' && (k.endsWith('_id') || k === 'id' || k === 'count')) {
      out[k] = String(v);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

function rows<T>(raw: Record<string, unknown>[]): T[] {
  return raw.map((r) => row<T>(r) as T);
}

// ─── Schema Init ────────────────────────────────────────────────────────────

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  email       TEXT    UNIQUE NOT NULL,
  username    TEXT    UNIQUE NOT NULL,
  password    TEXT    NOT NULL,
  name        TEXT    NOT NULL DEFAULT '',
  bio         TEXT    NOT NULL DEFAULT '',
  avatar      TEXT    NOT NULL DEFAULT '',
  theme       TEXT    NOT NULL DEFAULT 'system',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  badge       TEXT    NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT    NOT NULL,
  image       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  content     TEXT    NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follows (
  id           SERIAL PRIMARY KEY,
  follower_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT    NOT NULL,
  actor_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     INTEGER REFERENCES posts(id) ON DELETE SET NULL,
  content     TEXT,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  sender_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT    NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocks (
  id          SERIAL PRIMARY KEY,
  blocker_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id          SERIAL PRIMARY KEY,
  reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     INTEGER REFERENCES posts(id) ON DELETE SET NULL,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reason      TEXT    NOT NULL,
  description TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hashtags (
  id          SERIAL PRIMARY KEY,
  tag         TEXT    UNIQUE NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0,
  last_used   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id               INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme                 TEXT    NOT NULL DEFAULT 'system',
  email_notifications    BOOLEAN NOT NULL DEFAULT TRUE,
  notif_likes           BOOLEAN NOT NULL DEFAULT TRUE,
  notif_comments        BOOLEAN NOT NULL DEFAULT TRUE,
  notif_follows         BOOLEAN NOT NULL DEFAULT TRUE,
  notif_messages        BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reposts (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS sse_events (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type  TEXT    NOT NULL,
  payload     JSONB   NOT NULL DEFAULT '{}',
  delivered   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

let schemaInitialized = false;
async function initSchema() {
  if (schemaInitialized) return;
  const db = getDb();
  // Neon batch-queries: split by semicolon and run separately
  const statements = SCHEMA.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  for (const stmt of statements) {
    await db.unsafe(stmt);
  }
  schemaInitialized = true;
}

// ─── User ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  name: string;
  bio: string;
  avatar: string;
  theme?: 'light' | 'dark' | 'system';
  isVerified?: boolean;
  badge?: string;
  createdAt: string;
}

export async function getUserById(id: string): Promise<User | undefined> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT * FROM users WHERE id = ${id}`;
  return row<User>(result[0] ?? null);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT * FROM users WHERE email = ${email}`;
  return row<User>(result[0] ?? null);
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT * FROM users WHERE username = ${username}`;
  return row<User>(result[0] ?? null);
}

export async function searchUsers(query: string): Promise<User[]> {
  await initSchema();
  const db = getDb();
  const likePattern = `%${query}%`;
  const result = await db`SELECT * FROM users WHERE username LIKE ${likePattern} OR name LIKE ${likePattern} LIMIT 10`;
  return rows<User>(result);
}

export async function createUser(
  email: string,
  username: string,
  password: string,
  name: string,
): Promise<User> {
  await initSchema();
  const db = getDb();
  const avatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
  const result = await db`
    INSERT INTO users (email, username, password, name, avatar)
    VALUES (${email}, ${username}, ${password}, ${name}, ${avatar})
    RETURNING *
  `;
  await db`INSERT INTO user_preferences (user_id) VALUES (${result[0].id})`;
  return row<User>(result[0])!;
}

export async function updateUser(
  id: string,
  fields: { name?: string; bio?: string; theme?: string; avatar?: string; password?: string },
): Promise<User | undefined> {
  await initSchema();

  const sets: string[] = [];
  const vals: (string | undefined)[] = [];
  if (fields.name !== undefined)     { sets.push('name'); vals.push(fields.name); }
  if (fields.bio !== undefined)    { sets.push('bio'); vals.push(fields.bio); }
  if (fields.theme !== undefined)   { sets.push('theme'); vals.push(fields.theme); }
  if (fields.avatar !== undefined) { sets.push('avatar'); vals.push(fields.avatar); }
  if (fields.password !== undefined) { sets.push('password'); vals.push(fields.password); }

  if (sets.length === 0) return getUserById(id);

  const db = getDb();
  const setPairs = sets.map((col, i) => `${col} = $${i + 1}`);
  vals.push(id);
  await db.query(`UPDATE users SET ${setPairs.join(', ')} WHERE id = $${vals.length}`, vals);
  return getUserById(id);
}

export async function setUserVerified(userId: string, verified: boolean): Promise<void> {
  await initSchema();
  const db = getDb();
  await db`UPDATE users SET is_verified = ${verified} WHERE id = ${userId}`;
}

export async function setUserBadge(userId: string, badge: string): Promise<void> {
  await initSchema();
  const db = getDb();
  await db`UPDATE users SET badge = ${badge} WHERE id = ${userId}`;
}

export async function getTopCreators(limit: number = 10): Promise<User[]> {
  await initSchema();
  const db = getDb();
  const result = await db`
    SELECT u.*,
      (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id) as post_count,
      (SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id) as follower_count
    FROM users u
    WHERE u.badge = 'creator'
    ORDER BY follower_count DESC
    LIMIT ${limit}
  `;
  return rows<User>(result);
}

// ─── Post ─────────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  userId: string;
  content: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getPostById(id: string): Promise<Post | undefined> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT * FROM posts WHERE id = ${id}`;
  return row<Post>(result[0] ?? null);
}

export async function getAllPosts(): Promise<Post[]> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT * FROM posts ORDER BY created_at DESC`;
  return rows<Post>(result);
}

export async function getPostsByUserId(userId: string): Promise<Post[]> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT * FROM posts WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return rows<Post>(result);
}

export async function createPost(userId: string, content: string, image?: string): Promise<Post> {
  await initSchema();
  const db = getDb();
  const result = await db`
    INSERT INTO posts (user_id, content, image)
    VALUES (${userId}, ${content}, ${image ?? null})
    RETURNING *
  `;
  void extractHashtags(content);
  return row<Post>(result[0])!;
}

export async function updatePost(postId: string, content: string, image?: string): Promise<Post | undefined> {
  await initSchema();
  const db = getDb();
  await db`UPDATE posts SET content = ${content}, updated_at = NOW()${image ? db`, image = ${image}` : db``} WHERE id = ${postId}`;
  void extractHashtags(content);
  return getPostById(postId);
}

export async function deletePost(postId: string): Promise<boolean> {
  await initSchema();
  const db = getDb();
  const result = await db`DELETE FROM posts WHERE id = ${postId}`;
  return ((result as unknown as { rowCount?: number }).rowCount ?? 0) > 0;
}

// ─── Like ─────────────────────────────────────────────────────────────────

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export async function addLike(userId: string, postId: string): Promise<Like | undefined> {
  await initSchema();
  const db = getDb();
  try {
    const result = await db`
      INSERT INTO likes (user_id, post_id)
      VALUES (${userId}, ${postId})
      RETURNING *
    `;
    return row<Like>(result[0]);
  } catch {
    return undefined;
  }
}

export async function removeLike(userId: string, postId: string): Promise<boolean> {
  await initSchema();
  const db = getDb();
  const result = await db`DELETE FROM likes WHERE user_id = ${userId} AND post_id = ${postId}`;
  return ((result as unknown as { rowCount?: number }).rowCount ?? 0) > 0;
}

export async function getLikeCount(postId: string): Promise<number> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT COUNT(*) as c FROM likes WHERE post_id = ${postId}`;
  return Number(result[0]?.c ?? 0);
}

export async function isPostLikedByUser(userId: string, postId: string): Promise<boolean> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT 1 FROM likes WHERE user_id = ${userId} AND post_id = ${postId}`;
  return result.length > 0;
}

// ─── Comment ──────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
}

export async function addComment(userId: string, postId: string, content: string): Promise<Comment> {
  await initSchema();
  const db = getDb();
  const result = await db`
    INSERT INTO comments (user_id, post_id, content)
    VALUES (${userId}, ${postId}, ${content})
    RETURNING *
  `;
  return row<Comment>(result[0])!;
}

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT * FROM comments WHERE post_id = ${postId} ORDER BY created_at ASC`;
  return rows<Comment>(result);
}

export async function getCommentCount(postId: string): Promise<number> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT COUNT(*) as c FROM comments WHERE post_id = ${postId}`;
  return Number(result[0]?.c ?? 0);
}

export async function getCommentById(commentId: string): Promise<Comment | undefined> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT * FROM comments WHERE id = ${commentId}`;
  return row<Comment>(result[0] ?? null);
}

export async function deleteComment(commentId: string): Promise<boolean> {
  await initSchema();
  const db = getDb();
  const result = await db`DELETE FROM comments WHERE id = ${commentId}`;
  return ((result as unknown as { rowCount?: number }).rowCount ?? 0) > 0;
}

// ─── Follow ────────────────────────────────────────────────────────────────

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export async function addFollow(followerId: string, followingId: string): Promise<Follow | undefined> {
  await initSchema();
  const db = getDb();
  try {
    const result = await db`
      INSERT INTO follows (follower_id, following_id)
      VALUES (${followerId}, ${followingId})
      RETURNING *
    `;
    return row<Follow>(result[0]);
  } catch {
    return undefined;
  }
}

export async function removeFollow(followerId: string, followingId: string): Promise<boolean> {
  await initSchema();
  const db = getDb();
  const result = await db`DELETE FROM follows WHERE follower_id = ${followerId} AND following_id = ${followingId}`;
  return ((result as unknown as { rowCount?: number }).rowCount ?? 0) > 0;
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT 1 FROM follows WHERE follower_id = ${followerId} AND following_id = ${followingId}`;
  return result.length > 0;
}

export async function getFollowerCount(userId: string): Promise<number> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT COUNT(*) as c FROM follows WHERE following_id = ${userId}`;
  return Number(result[0]?.c ?? 0);
}

export async function getFollowingCount(userId: string): Promise<number> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT COUNT(*) as c FROM follows WHERE follower_id = ${userId}`;
  return Number(result[0]?.c ?? 0);
}

export async function getFollowers(userId: string): Promise<User[]> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT u.* FROM users u
    INNER JOIN follows f ON f.follower_id = u.id
    WHERE f.following_id = ${userId}
    ORDER BY f.created_at DESC`;
  return rows<User>(result);
}

export async function getFollowing(userId: string): Promise<User[]> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT u.* FROM users u
    INNER JOIN follows f ON f.following_id = u.id
    WHERE f.follower_id = ${userId}
    ORDER BY f.created_at DESC`;
  return rows<User>(result);
}

// ─── Bookmark ─────────────────────────────────────────────────────────────

export interface Bookmark {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export async function addBookmark(userId: string, postId: string): Promise<Bookmark | undefined> {
  await initSchema();
  const db = getDb();
  try {
    const result = await db`
      INSERT INTO bookmarks (user_id, post_id)
      VALUES (${userId}, ${postId})
      RETURNING *
    `;
    return row<Bookmark>(result[0]);
  } catch {
    return undefined;
  }
}

export async function removeBookmark(userId: string, postId: string): Promise<boolean> {
  await initSchema();
  const db = getDb();
  const result = await db`DELETE FROM bookmarks WHERE user_id = ${userId} AND post_id = ${postId}`;
  return ((result as unknown as { rowCount?: number }).rowCount ?? 0) > 0;
}

export async function isPostBookmarked(userId: string, postId: string): Promise<boolean> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT 1 FROM bookmarks WHERE user_id = ${userId} AND post_id = ${postId}`;
  return result.length > 0;
}

export async function getBookmarkedPosts(userId: string): Promise<Post[]> {
  await initSchema();
  const db = getDb();
  const result = await db`
    SELECT p.* FROM posts p INNER JOIN bookmarks b ON b.post_id = p.id
    WHERE b.user_id = ${userId} ORDER BY b.created_at DESC
  `;
  return rows<Post>(result);
}

// ─── Notification ─────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'message';
  actorId: string;
  postId?: string;
  content?: string;
  read: boolean;
  createdAt: string;
}

export async function createNotification(
  userId: string,
  type: Notification['type'],
  actorId: string,
  postId?: string,
  content?: string,
): Promise<Notification> {
  await initSchema();
  const db = getDb();
  const result = await db`
    INSERT INTO notifications (user_id, type, actor_id, post_id, content)
    VALUES (${userId}, ${type}, ${actorId}, ${postId ?? null}, ${content ?? null})
    RETURNING *
  `;
  return row<Notification>(result[0])!;
}

export async function getNotificationsByUserId(userId: string): Promise<Notification[]> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT * FROM notifications WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return rows<Notification>(result);
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT COUNT(*) as c FROM notifications WHERE user_id = ${userId} AND read = FALSE`;
  return Number(result[0]?.c ?? 0);
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  await initSchema();
  const db = getDb();
  const result = await db`UPDATE notifications SET read = TRUE WHERE id = ${notificationId}`;
  return ((result as unknown as { rowCount?: number }).rowCount ?? 0) > 0;
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await initSchema();
  const db = getDb();
  await db`UPDATE notifications SET read = TRUE WHERE user_id = ${userId}`;
}

// ─── Message ──────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export async function createMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
  await initSchema();
  const db = getDb();
  const result = await db`
    INSERT INTO messages (sender_id, receiver_id, content)
    VALUES (${senderId}, ${receiverId}, ${content})
    RETURNING *
  `;
  return row<Message>(result[0])!;
}

export async function getConversation(userId1: string, userId2: string): Promise<Message[]> {
  await initSchema();
  const db = getDb();
  const result = await db`
    SELECT * FROM messages
    WHERE (sender_id = ${userId1} AND receiver_id = ${userId2})
       OR (sender_id = ${userId2} AND receiver_id = ${userId1})
    ORDER BY created_at ASC
  `;
  return rows<Message>(result);
}

export async function getConversations(userId: string): Promise<Array<{ userId: string; lastMessage: Message }>> {
  await initSchema();
  const db = getDb();
  // Neon tagged template: use array syntax to pass params
  const result = await db`
    SELECT m.*
    FROM messages m
    WHERE m.id = (
      SELECT id FROM messages
      WHERE (sender_id = ${userId} AND receiver_id = m.receiver_id)
         OR (receiver_id = ${userId} AND sender_id = m.sender_id)
      ORDER BY created_at DESC
      LIMIT 1
    )
    AND (m.sender_id = ${userId} OR m.receiver_id = ${userId})
    ORDER BY m.created_at DESC
  `;

  return result.map((r: Record<string, unknown>) => {
    const msg = row<Message>(r)!;
    const senderId = String(r.sender_id);
    const receiverId = String(r.receiver_id);
    return { userId: senderId === userId ? receiverId : senderId, lastMessage: msg };
  });
}

export async function getUnreadMessagesCount(userId: string): Promise<number> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT COUNT(*) as c FROM messages WHERE receiver_id = ${userId} AND read = FALSE`;
  return Number(result[0]?.c ?? 0);
}

export async function markMessageAsRead(messageId: string): Promise<boolean> {
  await initSchema();
  const db = getDb();
  const result = await db`UPDATE messages SET read = TRUE WHERE id = ${messageId}`;
  return ((result as unknown as { rowCount?: number }).rowCount ?? 0) > 0;
}

// ─── Block ─────────────────────────────────────────────────────────────────

export interface Block {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export async function blockUser(blockerId: string, blockedId: string): Promise<Block | undefined> {
  await initSchema();
  const db = getDb();
  try {
    const result = await db`
      INSERT INTO blocks (blocker_id, blocked_id)
      VALUES (${blockerId}, ${blockedId})
      RETURNING *
    `;
    return row<Block>(result[0]);
  } catch {
    return undefined;
  }
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
  await initSchema();
  const db = getDb();
  const result = await db`DELETE FROM blocks WHERE blocker_id = ${blockerId} AND blocked_id = ${blockedId}`;
  return ((result as unknown as { rowCount?: number }).rowCount ?? 0) > 0;
}

export async function isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT 1 FROM blocks WHERE blocker_id = ${blockerId} AND blocked_id = ${blockedId}`;
  return result.length > 0;
}

export async function getBlockedUsers(userId: string): Promise<User[]> {
  await initSchema();
  const db = getDb();
  const result = await db`
    SELECT u.* FROM users u INNER JOIN blocks b ON b.blocked_id = u.id
    WHERE b.blocker_id = ${userId}
  `;
  return rows<User>(result);
}

// ─── Report ───────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  reporterId: string;
  postId?: string;
  userId?: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  createdAt: string;
}

export async function createReport(
  reporterId: string,
  reason: string,
  description: string,
  postId?: string,
  userId?: string,
): Promise<Report> {
  await initSchema();
  const db = getDb();
  const result = await db`
    INSERT INTO reports (reporter_id, post_id, user_id, reason, description)
    VALUES (${reporterId}, ${postId ?? null}, ${userId ?? null}, ${reason}, ${description})
    RETURNING *
  `;
  return row<Report>(result[0])!;
}

export async function getReports(status?: Report['status']): Promise<Report[]> {
  await initSchema();
  const db = getDb();
  let result;
  if (status) {
    result = await db`SELECT * FROM reports WHERE status = ${status} ORDER BY created_at DESC`;
  } else {
    result = await db`SELECT * FROM reports ORDER BY created_at DESC`;
  }
  return rows<Report>(result);
}

// ─── Hashtag ──────────────────────────────────────────────────────────────

export interface Hashtag {
  id: string;
  tag: string;
  count: number;
  lastUsed: string;
}

async function extractHashtags(content: string): Promise<void> {
  await initSchema();
  const tags = content.match(/#\w+/g) ?? [];
  if (tags.length === 0) return;
  const db = getDb();
  for (const raw of tags) {
    const tag = raw.slice(1).toLowerCase();
    await db`
      INSERT INTO hashtags (tag, count, last_used)
      VALUES (${tag}, 1, NOW())
      ON CONFLICT(tag) DO UPDATE SET count = hashtags.count + 1, last_used = NOW()
    `;
  }
}

export async function getTrendingHashtags(limit: number = 10): Promise<Hashtag[]> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT * FROM hashtags ORDER BY count DESC LIMIT ${limit}`;
  return rows<Hashtag>(result);
}

export async function searchHashtag(tag: string): Promise<Hashtag | undefined> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT * FROM hashtags WHERE tag = ${tag.toLowerCase()}`;
  return row<Hashtag>(result[0] ?? null);
}

// ─── User Preferences ─────────────────────────────────────────────────────

export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  notificationSettings: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    messages: boolean;
  };
  updatedAt: string;
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT * FROM user_preferences WHERE user_id = ${userId}`;
  const r = result[0] as Record<string, unknown> | undefined;
  if (!r) return undefined;
  return {
    userId:       String(r.user_id),
    theme:        r.theme as 'light' | 'dark' | 'system',
    emailNotifications: Boolean(r.email_notifications),
    notificationSettings: {
      likes:    Boolean(r.notif_likes),
      comments: Boolean(r.notif_comments),
      follows:  Boolean(r.notif_follows),
      messages: Boolean(r.notif_messages),
    },
    updatedAt: String(r.updated_at),
  };
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>,
): Promise<UserPreferences> {
  await initSchema();

  const db = getDb();

  const existing = await db`SELECT 1 FROM user_preferences WHERE user_id = ${userId}`;
  if (existing.length === 0) {
    await db`INSERT INTO user_preferences (user_id) VALUES (${userId})`;
  }

  const sets: string[] = ['updated_at = NOW()'];
  const vals: (string | boolean | undefined)[] = [];
  if (preferences.theme !== undefined)              { sets.push('theme = $' + (vals.length + 1)); vals.push(preferences.theme); }
  if (preferences.emailNotifications !== undefined) { sets.push('email_notifications = $' + (vals.length + 1)); vals.push(preferences.emailNotifications); }
  if (preferences.notificationSettings) {
    sets.push('notif_likes = $' + (vals.length + 1));     vals.push(preferences.notificationSettings.likes);
    sets.push('notif_comments = $' + (vals.length + 1)); vals.push(preferences.notificationSettings.comments);
    sets.push('notif_follows = $' + (vals.length + 1)); vals.push(preferences.notificationSettings.follows);
    sets.push('notif_messages = $' + (vals.length + 1)); vals.push(preferences.notificationSettings.messages);
  }
  vals.push(userId);
  await db.query(`UPDATE user_preferences SET ${sets.join(', ')} WHERE user_id = $${vals.length}`, vals);
  return (await getUserPreferences(userId))!;
}

// ─── Repost ────────────────────────────────────────────────────────────────

export interface Repost {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export async function addRepost(userId: string, postId: string): Promise<Repost | undefined> {
  await initSchema();
  const db = getDb();
  try {
    const result = await db`
      INSERT INTO reposts (user_id, post_id)
      VALUES (${userId}, ${postId})
      RETURNING *
    `;
    return row<Repost>(result[0]);
  } catch {
    return undefined;
  }
}

export async function removeRepost(userId: string, postId: string): Promise<boolean> {
  await initSchema();
  const db = getDb();
  const result = await db`DELETE FROM reposts WHERE user_id = ${userId} AND post_id = ${postId}`;
  return ((result as unknown as { rowCount?: number }).rowCount ?? 0) > 0;
}

export async function isPostRepostedByUser(userId: string, postId: string): Promise<boolean> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT 1 FROM reposts WHERE user_id = ${userId} AND post_id = ${postId}`;
  return result.length > 0;
}

export async function getRepostCount(postId: string): Promise<number> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT COUNT(*) as c FROM reposts WHERE post_id = ${postId}`;
  return Number(result[0]?.c ?? 0);
}

export async function getRepostsByUserId(userId: string): Promise<Repost[]> {
  await initSchema();
  const db = getDb();
  const result = await db`SELECT * FROM reposts WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return rows<Repost>(result);
}

// ─── SSE Events ────────────────────────────────────────────────────────────

export interface SSEEvent {
  id: string;
  userId: string;
  eventType: string;
  payload: Record<string, unknown>;
  delivered: boolean;
  createdAt: string;
}

export async function pushSSEEvent(
  userId: string,
  eventType: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  await initSchema();
  const db = getDb();
  await db`
    INSERT INTO sse_events (user_id, event_type, payload)
    VALUES (${userId}, ${eventType}, ${JSON.stringify(payload)})
  `;
}

export async function consumeSSEEvents(userId: string): Promise<SSEEvent[]> {
  await initSchema();
  const db = getDb();
  const result = await db`
    SELECT id, user_id, event_type, payload, delivered, created_at
    FROM sse_events
    WHERE user_id = ${userId} AND delivered = FALSE
    ORDER BY created_at ASC
    LIMIT 50
  `;
  if (result.length === 0) return [];
  const ids = result.map(r => Number((r as Record<string, unknown>).id));
  await db`UPDATE sse_events SET delivered = TRUE WHERE id = ANY(${ids})`;
  return result.map(r => {
    const rec = r as Record<string, unknown>;
    return {
      id:         String(rec.id),
      userId:     String(rec.user_id),
      eventType:  String(rec.event_type),
      payload:    rec.payload as Record<string, unknown>,
      delivered:  Boolean(rec.delivered),
      createdAt:  String(rec.created_at),
    };
  });
}
