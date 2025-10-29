/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Copy, Trash2, Check, QrCode } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import QRCode from "react-qr-code";

interface PostCardProps {
  post: {
    _id: string;
    text?: string;
    images: string[];
    createdAt: string;
    expiresAt: string;
  };
  onDelete: (id: string) => void;
}

function PostCardComponent({ post, onDelete }: PostCardProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [copied, setCopied] = useState(false);

  // 🕒 Countdown Timer (purely visual, lightweight)
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const expiry = new Date(post.expiresAt).getTime();
      const distance = expiry - now;

      if (distance <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [post.expiresAt]);

  // 📋 Memoized copy handler
  const handleCopy = useCallback(async () => {
    if (!post.text) return;
    await navigator.clipboard.writeText(post.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [post.text]);

  // 🗑️ Memoized delete handler
  const handleDelete = useCallback(() => {
    if (confirm("Are you sure you want to delete this post?")) {
      onDelete(post._id);
    }
  }, [onDelete, post._id]);

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-white/20 transition-all duration-300 group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
          Posted{" "}
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </div>

        {/* QR Dialog Trigger */}
        {post.text && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-muted/20 p-2 rounded-full transition-all"
              >
                <QrCode className="w-8 h-8 text-muted-foreground hover:text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs sm:max-w-sm bg-background/90 backdrop-blur-md border border-border/30 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-center text-lg font-semibold">
                  Scan with your camera
                </DialogTitle>
              </DialogHeader>
              <div className="flex justify-center items-center py-4">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <QRCode
                    value={post.text}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                  />
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Point your Google Lens or Camera to scan.
              </p>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Text Content */}
      {post.text && (
        <div className="mb-4 max-h-42 overflow-y-auto whitespace-pre-wrap break-words text-sm bg-muted/20 backdrop-blur-sm p-4 rounded-xl scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-ring border border-border/30">
          {post.text}
        </div>
      )}

      {/* Images */}
      {post.images?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {post.images.map((image, index) => (
            <div
              key={index}
              className="relative rounded-xl overflow-hidden ring-1 ring-border/30 hover:ring-border/50 transition-all duration-200 group/img"
            >
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover/img:scale-105"
              />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border/30">
        {post.text && (
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="gap-2 backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all duration-200 rounded-xl cursor-pointer"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}
        <Button
          onClick={handleDelete}
          variant="outline"
          size="sm"
          className="gap-2 backdrop-blur-sm hover:scale-105 transition-all duration-200 rounded-xl cursor-pointer text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// 🧠 Memoized to prevent re-render unless post or onDelete changes
export const PostCard = memo(PostCardComponent);
export default PostCard;
