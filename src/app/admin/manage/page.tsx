"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import RichTextEditor from '../../../components/RichTextEditor';

// --- SUB-COMPONENT: This represents a single draggable project row ---
function SortableProjectRow({ project, startEditing, handleToggleArchive, handleDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-white/10 rounded-2xl transition gap-4 ${project.is_archived ? 'bg-slate-900/30 opacity-70' : 'bg-slate-900/60 backdrop-blur-xl'}`}>
      
      {/* THE BURGER DRAG HANDLE */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-3 text-gray-500 hover:text-white transition rounded-lg hover:bg-white/10 touch-none">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
      </div>

      <div className="pr-4 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-medium text-white">{project.title}</h3>
          {project.is_featured && !project.is_archived && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-900/40 text-blue-400 border border-blue-800 rounded-full">FEATURED</span>
          )}
          {project.is_archived && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-900/40 text-yellow-500 border border-yellow-800 rounded-full">ARCHIVED</span>
          )}
        </div>
        <p className="text-sm text-gray-400 line-clamp-1">{project.description}</p>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => handleToggleArchive(project.id, project.is_archived)} className={`px-4 py-2 border rounded-lg transition text-sm ${project.is_archived ? 'bg-green-900/20 text-green-400 border-green-900/50 hover:bg-green-900 hover:text-white' : 'bg-yellow-900/20 text-yellow-500 border-yellow-900/50 hover:bg-yellow-900 hover:text-white'}`}>
          {project.is_archived ? 'Unarchive' : 'Archive'}
        </button>
        <button onClick={() => startEditing(project)} className="px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg hover:bg-slate-700 transition text-sm">Edit</button>
        <button onClick={() => handleDelete(project.id)} className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-900/50 rounded-lg hover:bg-red-900 hover:text-white transition text-sm">Delete</button>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function ManageProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  // Edit States
  const [editingProject, setEditingProject] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [liveUrl, setLiveUrl] = useState(''); // NEW STATE FOR LIVE DEMO
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  };

  // --- DRAG AND DROP SAVE LOGIC ---
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setProjects((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        saveNewOrder(newItems);
        return newItems;
      });
    }
  };

  const saveNewOrder = async (newItems: any[]) => {
    setStatus('Saving new order...');
    for (let i = 0; i < newItems.length; i++) {
      await supabase.from('projects').update({ sort_order: i }).eq('id', newItems[i].id);
    }
    setStatus('Order saved!');
    setTimeout(() => setStatus(''), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    fetchProjects(); 
  };

  const handleToggleArchive = async (id: string, currentStatus: boolean) => {
    setStatus('Updating status...');
    const { error } = await supabase.from('projects').update({ is_archived: !currentStatus }).eq('id', id);
    if (!error) fetchProjects();
    setStatus('');
  };

  const startEditing = (project: any) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description);
    setTechStack(project.tech_stack ? project.tech_stack.join(', ') : '');
    setLiveUrl(project.live_demo_url || ''); // LOAD EXISTING LIVE DEMO URL
    setIsFeatured(project.is_featured || false);
    setImageFile(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setStatus('Processing...');

    let imageUrl = editingProject.image_url;

    if (imageFile) {
      setStatus('Uploading new image...');
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(filePath, imageFile);
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('portfolio-images').getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }
    }

    const techArray = techStack.split(',').map((tech) => tech.trim());

    const { error: dbError } = await supabase.from('projects')
      .update({ 
        title, 
        description, 
        tech_stack: techArray, 
        image_url: imageUrl, 
        is_featured: isFeatured, 
        live_demo_url: liveUrl // SAVE LIVE DEMO URL ON UPDATE
      })
      .eq('id', editingProject.id);

    if (!dbError) {
      setStatus('Project updated successfully!');
      setTimeout(() => {
        setEditingProject(null);
        fetchProjects();
      }, 1500);
    }
    setUploading(false);
  };

  if (loading) return <div className="text-gray-400 animate-pulse">Fetching your projects...</div>;

  // === VIEW 1: EDIT FORM ===
  if (editingProject) {
    return (
      <div className="max-w-2xl border border-gray-800 bg-gray-900/40 p-6 md:p-8 rounded-2xl backdrop-blur-sm">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit Project</h1>
          <button onClick={() => setEditingProject(null)} className="text-sm text-gray-400 hover:text-white transition">Cancel</button>
        </div>
        
        <form onSubmit={handleUpdate} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Project Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <RichTextEditor value={description} onChange={setDescription} placeholder="Edit your project case study here..." />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tech Stack (comma separated)</label>
            <input type="text" required value={techStack} onChange={(e) => setTechStack(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" />
          </div>

          {/* NEW: LIVE DEMO INPUT FIELD */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Live Demo URL (Optional)</label>
            <input type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" placeholder="https://your-live-project.com" />
          </div>

          <div className="flex flex-col md:flex-row gap-6 p-4 border border-gray-800 bg-black/50 rounded-lg">
            <div className="flex-1">
               <label className="block text-sm text-gray-400 mb-2">Update Image</label>
               <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white" />
            </div>
            <div className="flex items-center gap-3">
               <input type="checkbox" id="edit-featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-5 h-5 accent-blue-600 rounded cursor-pointer" />
               <label htmlFor="edit-featured" className="text-sm text-white cursor-pointer select-none">Mark as Featured</label>
            </div>
          </div>

          <button type="submit" disabled={uploading} className="mt-2 bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition">
            {uploading ? 'Processing...' : 'Save Changes'}
          </button>
          {status && <p className="mt-2 text-center text-sm font-medium text-green-400">{status}</p>}
        </form>
      </div>
    );
  }

  // === VIEW 2: DRAG AND DROP PROJECT LIST ===
  return (
    <div className="max-w-3xl border border-white/5 bg-slate-900/40 p-8 rounded-[2rem] backdrop-blur-2xl">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-bold tracking-tight">Manage Projects</h1>
         {status && <span className="text-sm text-green-400 animate-pulse bg-green-900/30 px-3 py-1 rounded-full">{status}</span>}
      </div>
      
      {/* DND CONTEXT WRAPPER */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={projects} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-4">
            {projects.map((project) => (
              <SortableProjectRow 
                key={project.id} 
                project={project} 
                startEditing={startEditing} 
                handleToggleArchive={handleToggleArchive} 
                handleDelete={handleDelete} 
              />
            ))}
            {projects.length === 0 && <p className="text-gray-500 text-center py-10">No projects found.</p>}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}