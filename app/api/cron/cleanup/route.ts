import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/lib/models/Post';
import { del } from '@vercel/blob';

// This endpoint should be called by a cron job (e.g., Vercel Cron Jobs)
// to clean up expired posts and their associated images
export async function GET() {
  try {
    await connectDB();

    // Find all expired posts
    const expiredPosts = await Post.find({
      expiresAt: { $lt: new Date() },
    });

    let deletedCount = 0;
    let imagesDeletedCount = 0;

    // Delete images from Vercel Blob and posts from MongoDB
    for (const post of expiredPosts) {
      // Delete images from Vercel Blob
      if (post.images && post.images.length > 0) {
        for (const imageUrl of post.images) {
          try {
            await del(imageUrl);
            imagesDeletedCount++;
          } catch (error) {
            console.error('Error deleting image from blob:', error);
            // Continue even if blob deletion fails
          }
        }
      }

      // Delete the post from MongoDB
      await Post.findByIdAndDelete(post._id);
      deletedCount++;
    }

    return NextResponse.json(
      {
        message: 'Cleanup completed',
        postsDeleted: deletedCount,
        imagesDeleted: imagesDeletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
