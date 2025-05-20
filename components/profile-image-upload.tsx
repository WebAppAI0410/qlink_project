'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UploadIcon, Loader2Icon } from 'lucide-react';

interface ProfileImageUploadProps {
  userId: string;
  currentImageUrl?: string | null;
}

export function ProfileImageUpload({ userId, currentImageUrl }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // ファイルアップロード処理
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);
      
      const files = event.target.files;
      if (!files || files.length === 0) {
        throw new Error('画像を選択してください');
      }
      
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB制限
        throw new Error('ファイルサイズは2MB以下にしてください');
      }
      
      // 許可されるファイルタイプ
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('JPG、PNG、WEBP、GIF形式の画像のみアップロード可能です');
      }
      
      // ファイル名を生成（userId_timestamp.拡張子）
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `profile_images/${fileName}`;
      
      // Supabaseストレージにアップロード
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // 公開URLを取得
      const { data } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
      
      const publicUrl = data.publicUrl;
      
      // プロフィールテーブルを更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_pic_url: publicUrl })
        .eq('id', userId);
      
      if (updateError) {
        throw updateError;
      }
      
      setImageUrl(publicUrl);
    } catch (err: any) {
      console.error('画像アップロードエラー:', err);
      setError(err.message || 'アップロード中にエラーが発生しました');
    } finally {
      setUploading(false);
    }
  };

  const getInitial = () => {
    return userId.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt="プロフィール画像" />
          ) : (
            <AvatarFallback>{getInitial()}</AvatarFallback>
          )}
        </Avatar>
        
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
            <Loader2Icon className="animate-spin text-white" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="relative"
          disabled={uploading}
        >
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleUpload}
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading}
          />
          <UploadIcon className="mr-2 h-4 w-4" />
          プロフィール画像をアップロード
        </Button>
        
        {error && <p className="text-xs text-red-500">{error}</p>}
        <p className="text-xs text-muted-foreground">
          2MB以下のJPG、PNG、WEBP、GIF形式の画像
        </p>
      </div>
    </div>
  );
} 