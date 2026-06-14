"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function ProfileAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [coreArsenal, setCoreArsenal] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  // NEW: WhatsApp State
  const [whatsappUrl, setWhatsappUrl] = useState('');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profile').select('*').maybeSingle();
    if (data) {
      setFullName(data.full_name || '');
      setBio(data.bio || '');
      setAvatarUrl(data.avatar_url || '');
      setCoreArsenal(data.core_arsenal ? data.core_arsenal.join(', ') : '');
      setGithubUrl(data.github_url || '');
      setLinkedinUrl(data.linkedin_url || '');
      setTwitterUrl(data.twitter_url || '');
      setFacebookUrl(data.facebook_url || '');
      // NEW: Fetch WhatsApp
      setWhatsappUrl(data.whatsapp_url || '');
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus('Saving Profile...');

    let newAvatarUrl = avatarUrl;

    if (imageFile) {
      setStatus('Uploading avatar...');
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(`profile/${fileName}`, imageFile);
      
      if (uploadError) {
        setStatus(`Image Upload Error: ${uploadError.message}`);
        setSaving(false);
        return; 
      }

      const { data: publicUrlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(`profile/${fileName}`);
        
      newAvatarUrl = publicUrlData.publicUrl;
    }

    const arsenalArray = coreArsenal.split(',').map(item => item.trim()).filter(item => item !== '');

    // NEW: Include whatsapp_url in the save payload
    const profileData = {
      full_name: fullName, bio, avatar_url: newAvatarUrl, 
      core_arsenal: arsenalArray, github_url: githubUrl, linkedin_url: linkedinUrl, 
      twitter_url: twitterUrl, facebook_url: facebookUrl, whatsapp_url: whatsappUrl, updated_at: new Date()
    };

    const { data: existing } = await supabase.from('profile').select('id').maybeSingle();
    
    let error;
    if (existing) {
      const { error: updateError } = await supabase.from('profile').update(profileData).eq('id', existing.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('profile').insert([profileData]);
      error = insertError;
    }

    if (error) {
       setStatus(`Database Error: ${error.message}`);
    } else {
      setStatus('Profile updated successfully! 🎉');
      setAvatarUrl(newAvatarUrl);
      setTimeout(() => setStatus(''), 3000);
    }
    setSaving(false);
  };

  if (loading) return <div className="text-gray-400 animate-pulse">Loading profile settings...</div>;

  return (
    <div className="max-w-3xl border border-gray-800 bg-gray-900/40 p-6 md:p-8 rounded-2xl backdrop-blur-sm">
       <h1 className="text-3xl font-bold mb-8">Manage Profile & Arsenal</h1>
       
       <form onSubmit={handleSave} className="flex flex-col gap-5">
         
         <div className="p-5 border border-gray-800 bg-black/40 rounded-xl space-y-4">
           <h2 className="text-lg font-semibold text-white">Identity</h2>
           <div>
             <label className="block text-sm text-gray-400 mb-1">Full Name</label>
             <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" />
           </div>
           <div>
             <label className="block text-sm text-gray-400 mb-1">Short Bio</label>
             <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white h-24" />
           </div>
           
           <div className="flex items-center gap-4">
             {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full border border-gray-600 object-cover shadow-lg" />
             ) : (
                <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-xs text-gray-400">No DP</div>
             )}
             
             <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Profile Picture</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white" />
             </div>
           </div>
         </div>

         <div className="p-5 border border-gray-800 bg-black/40 rounded-xl space-y-4">
           <h2 className="text-lg font-semibold text-white">Core Arsenal</h2>
           <div>
             <label className="block text-sm text-gray-400 mb-1">Tech Stack (Comma Separated)</label>
             <input type="text" value={coreArsenal} onChange={e => setCoreArsenal(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" placeholder="Flutter, Kotlin, React..." />
           </div>
         </div>

         <div className="p-5 border border-gray-800 bg-black/40 rounded-xl space-y-4">
           <h2 className="text-lg font-semibold text-white">Social Media Links</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm text-gray-400 mb-1">GitHub URL</label>
               <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" placeholder="Leave empty to hide icon" />
             </div>
             <div>
               <label className="block text-sm text-gray-400 mb-1">LinkedIn URL</label>
               <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" placeholder="Leave empty to hide icon" />
             </div>
             <div>
               <label className="block text-sm text-gray-400 mb-1">Twitter / X URL</label>
               <input type="url" value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" placeholder="Leave empty to hide icon" />
             </div>
             <div>
               <label className="block text-sm text-gray-400 mb-1">Facebook URL</label>
               <input type="url" value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" placeholder="Leave empty to hide icon" />
             </div>
             {/* NEW: WhatsApp Input Field */}
             <div className="md:col-span-2">
               <label className="block text-sm text-gray-400 mb-1">WhatsApp URL (wa.me/number)</label>
               <input type="url" value={whatsappUrl} onChange={e => setWhatsappUrl(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" placeholder="https://wa.me/+8801XXXXXXXXX" />
               <p className="text-xs text-gray-500 mt-1">Leave empty to hide icon. Use format: https://wa.me/+8801XXXXXXXXX</p>
             </div>
           </div>
         </div>

         <button type="submit" disabled={saving} className="bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition">
           {saving ? 'Processing...' : 'Save Profile Dashboard'}
         </button>
         
         {status && <p className={`text-center text-sm font-medium ${status.includes('Error') ? 'text-red-500 bg-red-900/20 p-2 rounded' : 'text-green-400'}`}>{status}</p>}

       </form>
    </div>
  );
}