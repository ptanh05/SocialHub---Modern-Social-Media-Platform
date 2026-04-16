// Server-only database layer using better-sqlite3.
// Must NOT be imported from client components — use the API routes instead.

import path from 'path';

// Lazy dynamic import so this file is never bundled into the client.
async function openDb() {
  const { default: Database } = await import('better-sqlite3');
  const DB_PATH = path.join(process.cwd(), 'socialhub.db');
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

// Global singleton — survives Next.js hot-module-reload in dev.
declare global {
  // eslint-disable-next-line no-var
  var __db: Awaited<ReturnType<typeof openDb>> | undefined;
}

async function getDb() {
  if (!globalThis.__db) {
    globalThis.__db = await openDb();
  }
  return globalThis.__db;
}

// Exported for use in API routes that need raw SQL access (e.g., search)
export { getDb };

function initSchema(db: Awaited<ReturnType<typeof openDb>>) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      email       TEXT    UNIQUE NOT NULL,
      username    TEXT    UNIQUE NOT NULL,
      password    TEXT    NOT NULL,
      name        TEXT    NOT NULL DEFAULT '',
      bio         TEXT    NOT NULL DEFAULT '',
      avatar      TEXT    NOT NULL DEFAULT '',
      theme       TEXT    NOT NULL DEFAULT 'system',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content     TEXT    NOT NULL,
      image       TEXT,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS likes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, post_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      content     TEXT    NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS follows (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(follower_id, following_id)
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, post_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type        TEXT    NOT NULL,
      actor_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id     INTEGER REFERENCES posts(id) ON DELETE SET NULL,
      content     TEXT,
      read        INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content     TEXT    NOT NULL,
      read        INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blocks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      blocker_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      blocked_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(blocker_id, blocked_id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id     INTEGER REFERENCES posts(id) ON DELETE SET NULL,
      user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
      reason      TEXT    NOT NULL,
      description TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'pending',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS hashtags (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      tag         TEXT    UNIQUE NOT NULL,
      count       INTEGER NOT NULL DEFAULT 0,
      last_used   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id               INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      theme                 TEXT    NOT NULL DEFAULT 'system',
      email_notifications    INTEGER NOT NULL DEFAULT 1,
      notif_likes           INTEGER NOT NULL DEFAULT 1,
      notif_comments        INTEGER NOT NULL DEFAULT 1,
      notif_follows         INTEGER NOT NULL DEFAULT 1,
      notif_messages        INTEGER NOT NULL DEFAULT 1,
      updated_at            TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function row<T>(raw: any): T {
  if (!raw) return undefined as T;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === 'read' || k.startsWith('notif_') || k === 'email_notifications') {
      out[k] = Boolean(v);
    } else if (typeof v === 'number' && (k.endsWith('_id') || k === 'count')) {
      out[k] = String(v);
    } else {
      out[k] = v;
    }
  }
  return out as T;
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
  createdAt: string;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const db = await getDb();
  const r = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return row<User>(r);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  const r = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  return row<User>(r);
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const db = await getDb();
  const r = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  return row<User>(r);
}

export async function searchUsers(query: string): Promise<User[]> {
  const db = await getDb();
  const likePattern = `%${query}%`;
  return (db.prepare(
    'SELECT * FROM users WHERE username LIKE ? OR name LIKE ? LIMIT 10',
  ).all(likePattern, likePattern) as unknown[]).map(row<User>);
}

export async function createUser(
  email: string,
  username: string,
  password: string,
  name: string,
): Promise<User> {
  const db = await getDb();
  const avatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
  const id = String(
    db.prepare(
      'INSERT INTO users (email, username, password, name, avatar) VALUES (?, ?, ?, ?, ?)',
    ).run(email, username, password, name, avatar).lastInsertRowid,
  );
  return (await getUserById(id))!;
}

export async function updateUser(
  id: string,
  fields: { name?: string; bio?: string; theme?: string },
): Promise<User | undefined> {
  const db = await getDb();
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (fields.name !== undefined)  { sets.push('name = ?');  vals.push(fields.name); }
  if (fields.bio !== undefined)   { sets.push('bio = ?');   vals.push(fields.bio); }
  if (fields.theme !== undefined) { sets.push('theme = ?'); vals.push(fields.theme); }
  if (!sets.length) return getUserById(id);
  vals.push(id);
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getUserById(id);
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
  const db = await getDb();
  return row<Post>(db.prepare('SELECT * FROM posts WHERE id = ?').get(id));
}

export async function getAllPosts(): Promise<Post[]> {
  const db = await getDb();
  return (db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all() as unknown[]).map(row<Post>);
}

export async function getPostsByUserId(userId: string): Promise<Post[]> {
  const db = await getDb();
  return (db.prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC').all(userId) as unknown[]).map(row<Post>);
}

export async function createPost(userId: string, content: string, image?: string): Promise<Post> {
  const db = await getDb();
  const id = String(
    db.prepare('INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)').run(userId, content, image ?? null).lastInsertRowid,
  );
  void extractHashtags(content);
  return (await getPostById(id))!;
}

export async function updatePost(postId: string, content: string, image?: string): Promise<Post | undefined> {
  const db = await getDb();
  const sets = ['content = ?', 'updated_at = datetime("now")'];
  const vals: unknown[] = [content];
  if (image) { sets.push('image = ?'); vals.push(image); }
  vals.push(postId);
  db.prepare(`UPDATE posts SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  void extractHashtags(content);
  return getPostById(postId);
}

export async function deletePost(postId: string): Promise<boolean> {
  const db = await getDb();
  return db.prepare('DELETE FROM posts WHERE id = ?').run(postId).changes > 0;
}

// ─── Like ─────────────────────────────────────────────────────────────────

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export async function addLike(userId: string, postId: string): Promise<Like | undefined> {
  const db = await getDb();
  try {
    const id = String(
      db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(userId, postId).lastInsertRowid,
    );
    return row<Like>(db.prepare('SELECT * FROM likes WHERE id = ?').get(id));
  } catch {
    return undefined;
  }
}

export async function removeLike(userId: string, postId: string): Promise<boolean> {
  const db = await getDb();
  return db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(userId, postId).changes > 0;
}

export async function getLikeCount(postId: string): Promise<number> {
  const db = await getDb();
  const r = db.prepare('SELECT COUNT(*) as c FROM likes WHERE post_id = ?').get(postId) as { c: number };
  return r.c;
}

export async function isPostLikedByUser(userId: string, postId: string): Promise<boolean> {
  const db = await getDb();
  return !!db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?').get(userId, postId);
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
  const db = await getDb();
  const id = String(
    db.prepare('INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)').run(userId, postId, content).lastInsertRowid,
  );
  return row<Comment>(db.prepare('SELECT * FROM comments WHERE id = ?').get(id))!;
}

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  const db = await getDb();
  return (db.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC').all(postId) as unknown[]).map(row<Comment>);
}

export async function getCommentCount(postId: string): Promise<number> {
  const db = await getDb();
  const r = db.prepare('SELECT COUNT(*) as c FROM comments WHERE post_id = ?').get(postId) as { c: number };
  return r.c;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  const db = await getDb();
  return db.prepare('DELETE FROM comments WHERE id = ?').run(commentId).changes > 0;
}

// ─── Follow ────────────────────────────────────────────────────────────────

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export async function addFollow(followerId: string, followingId: string): Promise<Follow | undefined> {
  const db = await getDb();
  try {
    const id = String(
      db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(followerId, followingId).lastInsertRowid,
    );
    return row<Follow>(db.prepare('SELECT * FROM follows WHERE id = ?').get(id));
  } catch {
    return undefined;
  }
}

export async function removeFollow(followerId: string, followingId: string): Promise<boolean> {
  const db = await getDb();
  return db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(followerId, followingId).changes > 0;
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const db = await getDb();
  return !!db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(followerId, followingId);
}

export async function getFollowerCount(userId: string): Promise<number> {
  const db = await getDb();
  const r = db.prepare('SELECT COUNT(*) as c FROM follows WHERE following_id = ?').get(userId) as { c: number };
  return r.c;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const db = await getDb();
  const r = db.prepare('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?').get(userId) as { c: number };
  return r.c;
}

// ─── Bookmark ─────────────────────────────────────────────────────────────

export interface Bookmark {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export async function addBookmark(userId: string, postId: string): Promise<Bookmark | undefined> {
  const db = await getDb();
  try {
    const id = String(
      db.prepare('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)').run(userId, postId).lastInsertRowid,
    );
    return row<Bookmark>(db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(id));
  } catch {
    return undefined;
  }
}

export async function removeBookmark(userId: string, postId: string): Promise<boolean> {
  const db = await getDb();
  return db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?').run(userId, postId).changes > 0;
}

export async function isPostBookmarked(userId: string, postId: string): Promise<boolean> {
  const db = await getDb();
  return !!db.prepare('SELECT 1 FROM bookmarks WHERE user_id = ? AND post_id = ?').get(userId, postId);
}

export async function getBookmarkedPosts(userId: string): Promise<Post[]> {
  const db = await getDb();
  return (db.prepare(
    `SELECT p.* FROM posts p INNER JOIN bookmarks b ON b.post_id = p.id WHERE b.user_id = ? ORDER BY b.created_at DESC`,
  ).all(userId) as unknown[]).map(row<Post>);
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
  const db = await getDb();
  const id = String(
    db.prepare('INSERT INTO notifications (user_id, type, actor_id, post_id, content) VALUES (?, ?, ?, ?, ?)').run(
      userId, type, actorId, postId ?? null, content ?? null,
    ).lastInsertRowid,
  );
  return row<Notification>(db.prepare('SELECT * FROM notifications WHERE id = ?').get(id))!;
}

export async function getNotificationsByUserId(userId: string): Promise<Notification[]> {
  const db = await getDb();
  return (db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(userId) as unknown[]).map(row<Notification>);
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const db = await getDb();
  const r = db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND read = 0').get(userId) as { c: number };
  return r.c;
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const db = await getDb();
  return db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(notificationId).changes > 0;
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const db = await getDb();
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(userId);
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
  const db = await getDb();
  const id = String(
    db.prepare('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)').run(senderId, receiverId, content).lastInsertRowid,
  );
  return row<Message>(db.prepare('SELECT * FROM messages WHERE id = ?').get(id))!;
}

export async function getConversation(userId1: string, userId2: string): Promise<Message[]> {
  const db = await getDb();
  return (db.prepare(
    `SELECT * FROM messages
     WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
     ORDER BY created_at ASC`,
  ).all(userId1, userId2, userId2, userId1) as unknown[]).map(row<Message>);
}

export async function getConversations(userId: string): Promise<Array<{ userId: string; lastMessage: Message }>> {
  const db = await getDb();
  const rows = db.prepare(
    `SELECT * FROM (
       SELECT *,
         ROW_NUMBER() OVER (
           PARTITION BY CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
           ORDER BY created_at DESC
         ) as rn
       FROM messages
       WHERE sender_id = ? OR receiver_id = ?
     ) sub WHERE rn = 1 ORDER BY created_at DESC`,
  ).all(userId, userId, userId) as unknown[];
  return rows.map((r) => {
    const msg = row<Message>(r)!;
    return { userId: msg.senderId === userId ? msg.receiverId : msg.senderId, lastMessage: msg };
  });
}

export async function getUnreadMessagesCount(userId: string): Promise<number> {
  const db = await getDb();
  const r = db.prepare('SELECT COUNT(*) as c FROM messages WHERE receiver_id = ? AND read = 0').get(userId) as { c: number };
  return r.c;
}

export async function markMessageAsRead(messageId: string): Promise<boolean> {
  const db = await getDb();
  return db.prepare('UPDATE messages SET read = 1 WHERE id = ?').run(messageId).changes > 0;
}

// ─── Block ─────────────────────────────────────────────────────────────────

export interface Block {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export async function blockUser(blockerId: string, blockedId: string): Promise<Block | undefined> {
  const db = await getDb();
  try {
    const id = String(
      db.prepare('INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)').run(blockerId, blockedId).lastInsertRowid,
    );
    return row<Block>(db.prepare('SELECT * FROM blocks WHERE id = ?').get(id));
  } catch {
    return undefined;
  }
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
  const db = await getDb();
  return db.prepare('DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?').run(blockerId, blockedId).changes > 0;
}

export async function isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const db = await getDb();
  return !!db.prepare('SELECT 1 FROM blocks WHERE blocker_id = ? AND blocked_id = ?').get(blockerId, blockedId);
}

export async function getBlockedUsers(userId: string): Promise<User[]> {
  const db = await getDb();
  return (db.prepare(
    `SELECT u.* FROM users u INNER JOIN blocks b ON b.blocked_id = u.id WHERE b.blocker_id = ?`,
  ).all(userId) as unknown[]).map(row<User>);
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
  const db = await getDb();
  const id = String(
    db.prepare(
      'INSERT INTO reports (reporter_id, post_id, user_id, reason, description) VALUES (?, ?, ?, ?, ?)',
    ).run(reporterId, postId ?? null, userId ?? null, reason, description).lastInsertRowid,
  );
  return row<Report>(db.prepare('SELECT * FROM reports WHERE id = ?').get(id))!;
}

export async function getReports(status?: Report['status']): Promise<Report[]> {
  const db = await getDb();
  if (status) {
    return (db.prepare('SELECT * FROM reports WHERE status = ? ORDER BY created_at DESC').all(status) as unknown[]).map(row<Report>);
  }
  return (db.prepare('SELECT * FROM reports ORDER BY created_at DESC').all() as unknown[]).map(row<Report>);
}

// ─── Hashtag ──────────────────────────────────────────────────────────────

export interface Hashtag {
  id: string;
  tag: string;
  count: number;
  lastUsed: string;
}

async function extractHashtags(content: string): Promise<void> {
  const tags = content.match(/#\w+/g) ?? [];
  const db = await getDb();
  for (const raw of tags) {
    const tag = raw.slice(1).toLowerCase();
    db.prepare(
      `INSERT INTO hashtags (tag, count, last_used) VALUES (?, 1, datetime('now'))
       ON CONFLICT(tag) DO UPDATE SET count = count + 1, last_used = datetime('now')`,
    ).run(tag);
  }
}

export async function getTrendingHashtags(limit: number = 10): Promise<Hashtag[]> {
  const db = await getDb();
  return (db.prepare('SELECT * FROM hashtags ORDER BY count DESC LIMIT ?').all(limit) as unknown[]).map(row<Hashtag>);
}

export async function searchHashtag(tag: string): Promise<Hashtag | undefined> {
  const db = await getDb();
  return row<Hashtag>(db.prepare('SELECT * FROM hashtags WHERE tag = ?').get(tag.toLowerCase()));
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
  const db = await getDb();
  const r = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(userId) as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  } | undefined;
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
  const db = await getDb();
  if (!(await getUserPreferences(userId))) {
    db.prepare('INSERT INTO user_preferences (user_id) VALUES (?)').run(userId);
  }
  const sets: string[] = ['updated_at = datetime("now")'];
  const vals: unknown[] = [];
  if (preferences.theme !== undefined)             { sets.push('theme = ?');              vals.push(preferences.theme); }
  if (preferences.emailNotifications !== undefined)  { sets.push('email_notifications = ?'); vals.push(preferences.emailNotifications ? 1 : 0); }
  if (preferences.notificationSettings) {
    sets.push('notif_likes = ?');     vals.push(preferences.notificationSettings.likes ? 1 : 0);
    sets.push('notif_comments = ?');  vals.push(preferences.notificationSettings.comments ? 1 : 0);
    sets.push('notif_follows = ?');   vals.push(preferences.notificationSettings.follows ? 1 : 0);
    sets.push('notif_messages = ?');   vals.push(preferences.notificationSettings.messages ? 1 : 0);
  }
  vals.push(userId);
  db.prepare(`UPDATE user_preferences SET ${sets.join(', ')} WHERE user_id = ?`).run(...vals);
  return (await getUserPreferences(userId))!;
}
