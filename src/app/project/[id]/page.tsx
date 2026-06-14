import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import ThemeToggle from '../../../components/ThemeToggle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const dynamic = 'force-dynamic';

export default async function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
        <Link href="/" className="text-blue-500 hover:underline">← Back to Portfolio</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32">
      
      {/* Navbar */}
      <nav className="w-full max-w-5xl mx-auto p-6 flex justify-between items-center mb-4 relative z-50">
        <Link href="/" className="glass-panel px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2">
          ← Back to Portfolio
        </Link>
        <ThemeToggle />
      </nav>

      <article className="max-w-5xl mx-auto px-6">
        
        {/* Massive Premium Hero Image */}
        {project.image_url && (
          <div className="w-full h-[40vh] md:h-[60vh] rounded-[2.5rem] overflow-hidden relative shadow-2xl mb-12 glass-panel p-2">
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 rounded-[2rem]"></div>
             <img 
               src={project.image_url} 
               alt={project.title} 
               className="w-full h-full object-cover rounded-[2rem] z-0"
             />
             <div className="absolute bottom-10 left-10 z-20">
                <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-lg">
                  {project.title}
                </h1>
             </div>
          </div>
        )}

        {/* Floating Glass Tech Stack Bar */}
        <div className="w-full glass-panel rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-20 -mt-20 md:-mt-24 mx-auto max-w-4xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
           <div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                 {project.tech_stack?.map((tech: string) => (
                    <span key={tech} className="px-4 py-1.5 text-sm font-medium bg-gray-900/5 dark:bg-white/10 text-gray-800 dark:text-white border border-gray-900/10 dark:border-white/20 rounded-full">
                      {tech}
                    </span>
                 ))}
              </div>
           </div>
           
           <div className="flex gap-3 w-full md:w-auto">
              {/* NEW: ONLY SHOWS IF LIVE DEMO URL EXISTS */}
              {project.live_demo_url && (
                <a 
                  href={project.live_demo_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 md:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md flex justify-center items-center gap-2"
                >
                   Live Demo <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              )}
           </div>
        </div>

        {/* Full Case Study Markdown Content */}
        <div className="max-w-3xl mx-auto prose dark:prose-invert prose-lg prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500">
           {/* If there's no image, show the title here instead */}
           {!project.image_url && <h1 className="text-5xl font-extrabold mb-8">{project.title}</h1>}
           
           <ReactMarkdown remarkPlugins={[remarkGfm]}>
             {project.description}
           </ReactMarkdown>
        </div>

      </article>
    </main>
  );
}