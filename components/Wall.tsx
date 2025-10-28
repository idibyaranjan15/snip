"use client";

import { useState, useEffect, useRef } from "react";
import PostCard from "./PostCard";
import { Button } from "./ui/button";
import { Upload, Send, X, Loader } from "lucide-react";

interface Post {
  _id: string;
  text?: string;
  images: string[];
  createdAt: string;
  expiresAt: string;
}

export default function Wall() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data.posts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/svg+xml",
      "image/heic",
    ];

    const validFiles = files.filter((file) => {
      if (!validTypes.includes(file.type)) {
        alert(`❌ Invalid file type: ${file.name}`);
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        alert(`⚠️ File too large: ${file.name}. Max 100MB.`);
        return false;
      }
      return true;
    });

    setImages((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && images.length === 0) return alert("Add text or images");

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      images.forEach((img) => formData.append("images", img));

      const res = await fetch("/api/posts", { method: "POST", body: formData });
      if (res.ok) {
        setText("");
        setImages([]);
        setPreviews([]);
        fetchPosts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to post");
      }
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete post");
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden text-foreground">
      {/* 🔮 Background */}
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="font-caveat text-5xl md:text-6xl font-extrabold bg-white bg-clip-text text-transparent">
            Snip
          </h1>
          <p className="text-muted-foreground text-base mt-2">
            Drop it. Share it. Gone in 12.
          </p>
        </header>

        {/* Post Form */}
        <section className="mb-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[120px] bg-transparent border border-white/10 rounded-xl p-3 resize-y text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition"
            />

            {/* Image previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={src}
                      alt=""
                      className="rounded-xl object-cover w-full h-32 border border-white/10 group-hover:opacity-90 transition"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition hover:scale-110"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 border-white/20 text-white/80 hover:bg-white/10"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  jpg, png, gif, svg, heic (max 100MB each)
                </span>
              </div>

              <Button
                type="submit"
                variant={"outline"}
                disabled={isSubmitting || (!text.trim() && images.length === 0)}
                className="gap-2 px-5  text-white"
              >
                {isSubmitting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </section>

        {/* Posts */}
        <section className="space-y-6 pb-20">
          {loading ? (
            <div className="text-center text-muted-foreground py-12">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No posts yet. Be the first to drop something 🔥
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} onDelete={handleDelete} />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
