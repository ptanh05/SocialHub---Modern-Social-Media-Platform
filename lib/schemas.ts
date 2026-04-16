import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(500, 'Post must be at most 500 characters'),
  image: z.string().optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(300, 'Comment must be at most 300 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters').optional(),
  bio: z.string().max(150, 'Bio must be at most 150 characters').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
