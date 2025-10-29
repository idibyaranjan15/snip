/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Copy, Trash2, Check } from 'lucide-react';
import { Button } from './ui/button';

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

export default function PostCard({ post, onDelete }: PostCardProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(post.expiresAt).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        setTimeLeft('Expired');
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

  const handleCopy = async () => {
    if (post.text) {
      await navigator.clipboard.writeText(post.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this post?')) {
      onDelete(post._id);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-white/20 transition-all duration-300 group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse"></div>
          Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </div>
        <div className="flex items-center gap-2">
          {/* <div className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted/30 backdrop-blur-sm">
            <span className="text-foreground/90 font-medium">{timeLeft}</span>
          </div> */}
        </div>
      </div>

      {/* Text Content */}
      {post.text && (
        <div className="mb-4 max-h-42 overflow-y-auto whitespace-pre-wrap wrap-break-word text-sm bg-muted/20 backdrop-blur-sm p-4 rounded-xl scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-ring border border-border/30">
          {post.text}
        </div>
      )}

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {post.images.map((image, index) => (
            <div key={index} className="relative rounded-xl overflow-hidden ring-1 ring-border/30 hover:ring-border/50 transition-all duration-200 group/img">
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
              <>
                <Check className="h-4 w-4" />
               
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
              
              </>
            )}
          </Button>
        )}
        <Button
          onClick={handleDelete}
          variant="outline"
          size="sm"
          className="gap-2 backdrop-blur-sm hover:scale-105 transition-all duration-200 rounded-xl cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
         
        </Button>
      </div>
    </div>
  );
}
