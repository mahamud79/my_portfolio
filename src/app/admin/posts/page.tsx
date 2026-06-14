"use client";

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import RichTextEditor from '../../../components/RichTextEditor';

export default function WritePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setStatus('Publishing...');

    let imageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `posts/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        setStatus(`Image Upload Error: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName);
        
      imageUrl = publicUrlData.publicUrl;
    }

    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const { error: dbError } = await supabase
      .from('posts')
      .insert([{ 
        title: title, 
        slug: generatedSlug,
        content: content, 
        image_url: imageUrl 
      }]);

    if (dbError) {
      setStatus(`Database Error: ${dbError.message}`);
    } else {
      setStatus('Post published successfully! 🎉');
      setTitle('');
      setContent('');
      setImageFile(null);
      const fileInput = document.getElementById('post-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
    
    setUploading(false);
  };

  return (
    <div className="max-w-3xl border border-gray-800 bg-gray-900/40 p-6 md:p-8 rounded-2xl backdrop-blur-sm">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight">Write a New Post</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Post Title</label>
          <input 
            type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg p-4 text-white font-medium text-lg focus:outline-none focus:border-gray-500 transition"
            placeholder="e.g., How I built my AI medical vision tool"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6 p-4 border border-gray-800 bg-black/50 rounded-lg items-center">
          <div className="w-24 h-16 rounded-md bg-gray-800 border border-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
             {imageFile ? (
               <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
             ) : (
               <span className="text-xs text-gray-500">Cover</span>
             )}
          </div>
          <div className="flex-1 w-full">
             <label className="block text-sm text-gray-400 mb-2">Article Cover Image</label>
             <input 
               id="post-image" type="file" accept="image/*"
               onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
               className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 transition w-full"
             />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Article Content</label>
          {/* NEW: The Rich Text Editor replaces the old textarea! */}
          <RichTextEditor 
            value={content} 
            onChange={setContent} 
            placeholder="Write your article here..."
          />
        </div>

        <button 
          type="submit" disabled={uploading}
          className="mt-2 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {uploading ? 'Publishing...' : 'Publish Post'}
        </button>

        {status && (
          <p className={`mt-2 text-center text-sm font-medium ${status.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {status}
          </p>
        )}
      </form>
    </div>
  );
}