import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/lib/models/Post';
import { put } from '@vercel/blob';

// GET - Fetch all posts (reverse chronological order)
export async function GET() {
  try {
    await connectDB();

    const posts = await Post.find({
      expiresAt: { $gt: new Date() }, // Only fetch non-expired posts
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST - Create a new post
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const text = formData.get('text') as string;
    const files = formData.getAll('images') as File[];

    // Validate that at least text or images are provided
    if (!text && files.length === 0) {
      return NextResponse.json(
        { error: 'Either text or images must be provided' },
        { status: 400 }
      );
    }

    // Upload images to Vercel Blob
    const imageUrls: string[] = [];

    for (const file of files) {
      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size must be less than 100MB' },
          { status: 400 }
        );
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/heic'];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Allowed: jpg, jpeg, png, gif, svg, heic' },
          { status: 400 }
        );
      }

      // Upload to Vercel Blob
      const blob = await put(file.name, file, {
        access: 'public',
      });

      imageUrls.push(blob.url);
    }

    // Create post in MongoDB
    const post = await Post.create({
      text: text || '',
      images: imageUrls,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
