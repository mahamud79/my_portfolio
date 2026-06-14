"use client";

import { useState } from 'react';
import { supabase } from '../../lib/supabase'; // <-- CORRECTED PATH (Two dots)
import RichTextEditor from '../../components/RichTextEditor';

export default function AdminDashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [liveUrl, setLiveUrl] = useState(''); 
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setStatus('Processing...');

    let imageUrl = null;

    if (imageFile) {
      setStatus('Uploading image...');
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        setStatus(`Image Upload Error: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(filePath);
        
      imageUrl = publicUrlData.publicUrl;
    }

    setStatus('Saving project details...');
    const techArray = techStack.split(',').map((tech) => tech.trim());

    const { error: dbError } = await supabase
      .from('projects')
      .insert([
        { 
          title, 
          description, 
          tech_stack: techArray,
          image_url: imageUrl,
          is_featured: isFeatured,
          live_demo_url: liveUrl 
        }
      ]);

    if (dbError) {
      setStatus(`Database Error: ${dbError.message}`);
    } else {
      setStatus('Project added successfully! 🎉');
      setTitle(''); setDescription(''); setTechStack(''); setLiveUrl(''); setIsFeatured(false); setImageFile(null);
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
    
    setUploading(false);
  };

  return (
    <div className="max-w-2xl border border-gray-800 bg-gray-900/40 p-6 md:p-8 rounded-2xl backdrop-blur-sm">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight">Add New Project</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Project Title</label>
          <input 
            type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-gray-500 transition"
            placeholder="e.g., GlobalCarBD"
          />
        </div>

        <div>
            <label className="block text-sm text-gray-400 mb-2">Project Description & Case Study</label>
            <RichTextEditor value={description} onChange={setDescription} placeholder="Write your full project case study here..." />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Tech Stack (comma separated)</label>
          <input 
            type="text" required value={techStack} onChange={(e) => setTechStack(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-gray-500 transition"
            placeholder="e.g., PHP, MySQL, Hostinger"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Live Demo URL (Optional)</label>
          <input 
            type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} 
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-gray-500 transition" 
            placeholder="https://your-live-project.com" 
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6 p-4 border border-gray-800 bg-black/50 rounded-lg">
          <div className="flex-1">
             <label className="block text-sm text-gray-400 mb-2">Cover Image (Optional)</label>
             <input 
               id="image-upload" type="file" accept="image/*"
               onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
               className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 transition"
             />
          </div>
          <div className="flex items-center gap-3">
             <input 
               type="checkbox" id="featured" checked={isFeatured} 
               onChange={(e) => setIsFeatured(e.target.checked)}
               className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
             />
             <label htmlFor="featured" className="text-sm text-white cursor-pointer select-none">
                Mark as Featured<br/>
                <span className="text-xs text-gray-500">Shows in the big top slider</span>
             </label>
          </div>
        </div>

        <button 
          type="submit" disabled={uploading}
          className="mt-2 bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Processing...' : 'Save Project'}
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