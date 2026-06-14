"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import RichTextEditor from '../../../components/RichTextEditor'; // <-- NEW: Import the editor

export default function ManagePosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Mode States
  const [editingPost, setEditingPost] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setPosts(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this post? Consider archiving it instead.')) return;
    await supabase.from('posts').delete().eq('id', id);
    fetchPosts(); 
  };

  const handleToggleArchive = async (id: string, currentStatus: boolean) => {
    setStatus('Updating status...');
    const { error } = await supabase
      .from('posts')
      .update({ is_archived: !currentStatus })
      .eq('id', id);
      
    if (!error) fetchPosts();
    setStatus('');
  };

  const startEditing = (post: any) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setImageFile(null); 
    setStatus('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setStatus('Processing...');

    let imageUrl = editingPost.image_url;

    if (imageFile) {
      setStatus('Uploading new cover image...');
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

    setStatus('Updating article...');
    const { error: dbError } = await supabase
      .from('posts')
      .update({ 
        title, 
        content, 
        image_url: imageUrl
      })
      .eq('id', editingPost.id);

    if (dbError) {
      setStatus(`Database Error: ${dbError.message}`);
    } else {
      setStatus('Post updated successfully!');
      setTimeout(() => {
        setEditingPost(null);
        fetchPosts();
      }, 1500);
    }
    setUploading(false);
  };

  if (loading) {
    return <div className="text-gray-400 animate-pulse">Fetching your posts...</div>;
  }

  if (editingPost) {
    return (
      <div className="max-w-3xl border border-gray-800 bg-gray-900/40 p-6 md:p-8 rounded-2xl backdrop-blur-sm">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit Post</h1>
          <button onClick={() => setEditingPost(null)} className="text-sm text-gray-400 hover:text-white transition">
            Cancel
          </button>
        </div>
        
        <form onSubmit={handleUpdate} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Post Title</label>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg p-4 text-white font-medium text-lg focus:outline-none focus:border-gray-500 transition"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6 p-4 border border-gray-800 bg-black/50 rounded-lg items-center">
            <div className="w-24 h-16 rounded-md bg-gray-800 border border-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
               {imageFile ? (
                 <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
               ) : editingPost.image_url ? (
                 <img src={editingPost.image_url} alt="Current Cover" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-xs text-gray-500">Cover</span>
               )}
            </div>
            <div className="flex-1 w-full">
               <label className="block text-sm text-gray-400 mb-2">Update Cover Image (Optional)</label>
               <input 
                 type="file" accept="image/*"
                 onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                 className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 transition w-full"
               />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Article Content</label>
            {/* NEW: We replaced the textarea with the RichTextEditor! */}
            <RichTextEditor 
              value={content} 
              onChange={setContent} 
              placeholder="Edit your article here..."
            />
          </div>

          <button 
            type="submit" disabled={uploading}
            className="mt-2 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {uploading ? 'Saving...' : 'Save Changes'}
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

  return (
    <div className="max-w-3xl border border-gray-800 bg-gray-900/40 p-8 rounded-2xl backdrop-blur-sm">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-bold tracking-tight">Manage Posts</h1>
         {status && <span className="text-sm text-yellow-500 animate-pulse">{status}</span>}
      </div>
      
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <div key={post.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-800 rounded-xl transition gap-4 ${post.is_archived ? 'bg-gray-900/30 opacity-70' : 'bg-black hover:border-gray-700'}`}>
            <div className="pr-4 flex-1">
              <div className="flex items-center gap-2 mb-1">
                 <h3 className="text-lg font-medium text-white">{post.title}</h3>
                 {post.is_archived && (
                   <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-900/40 text-yellow-500 border border-yellow-800 rounded-full">
                     ARCHIVED
                   </span>
                 )}
              </div>
              {/* Note: We slice the markdown text just for the preview card to keep it clean */}
              <p className="text-sm text-gray-400 line-clamp-1">{post.content.slice(0, 100)}...</p>
              <div className="text-xs text-gray-500 mt-2 font-mono">
                {new Date(post.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleToggleArchive(post.id, post.is_archived)}
                className={`px-4 py-2 border rounded-lg transition text-sm ${post.is_archived ? 'bg-green-900/20 text-green-400 border-green-900/50 hover:bg-green-900 hover:text-white' : 'bg-yellow-900/20 text-yellow-500 border-yellow-900/50 hover:bg-yellow-900 hover:text-white'}`}
              >
                {post.is_archived ? 'Unarchive' : 'Archive'}
              </button>
              
              <button
                onClick={() => startEditing(post)}
                className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-900/50 rounded-lg hover:bg-red-900 hover:text-white transition text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-10 border border-dashed border-gray-800 rounded-xl">
            <p className="text-gray-500">No posts found. Go write some!</p>
          </div>
        )}
      </div>
    </div>
  );
}