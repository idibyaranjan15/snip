import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/lib/models/Post';
import { del } from '@vercel/blob';

// DELETE - Delete a post by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Find the post first to get image URLs
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Delete images from Vercel Blob
    if (post.images && post.images.length > 0) {
      for (const imageUrl of post.images) {
        try {
          await del(imageUrl);
        } catch (error) {
          console.error('Error deleting image from blob:', error);
          // Continue even if blob deletion fails
        }
      }
    }

    // Delete the post from MongoDB
    await Post.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Post deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
