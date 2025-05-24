'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Twitter } from "lucide-react";

interface ShareButtonsProps {
  questionShortId: string;
  questionContent: string;
}

export function ShareButtons({ questionShortId, questionContent }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/q/${questionShortId}`;
  const tweetText = `${questionContent.slice(0, 100)}${questionContent.length > 100 ? '...' : ''}\n\n匿名で回答してください！`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  const handleTwitterShare = () => {
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-xl px-3 py-2 border border-blue-200">
        <span className="text-sm text-gray-600 font-mono break-all">
          {shareUrl}
        </span>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="rounded-xl border-blue-200 hover:border-blue-300 hover:bg-blue-50 flex-1 sm:flex-none"
        >
          <Copy size={14} className="mr-2" />
          {copied ? '✅ コピー済み' : '📋 コピー'}
        </Button>
        
        <Button
          onClick={handleTwitterShare}
          variant="outline"
          size="sm"
          className="rounded-xl border-blue-200 hover:border-blue-300 hover:bg-blue-50 flex-1 sm:flex-none"
        >
          <Twitter size={14} className="mr-2" />
          🐦 Xに共有
        </Button>
      </div>
    </div>
  );
} 