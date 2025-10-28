import mongoose, { Schema, Document, models } from 'mongoose';

export interface IPost extends Document {
  text?: string;
  images: string[]; // Array of Vercel Blob URLs
  createdAt: Date;
  expiresAt: Date;
}

const PostSchema = new Schema<IPost>({
  text: {
    type: String,
    default: '',
  },
  images: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    index: true, // Index for efficient cleanup queries
  },
});

// Create TTL index to auto-delete expired documents
PostSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Post = models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
