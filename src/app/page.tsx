import Link from 'next/link';
import { supabase } from '../lib/supabase';
import ThemeToggle from '../components/ThemeToggle';
import ProjectSlider from '../components/ProjectSlider';
import SearchTrigger from '../components/SearchTrigger';
import SpotlightCard from '../components/SpotlightCard';
import ScrollReveal from '../components/ScrollReveal';
import QuickNav from '../components/QuickNav';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: profile } = await supabase.from('profile').select('*').maybeSingle();
  
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('is_archived', false)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .limit(3);

  const featuredProjects = projects?.filter(p => p.is_featured) || [];
  const regularProjects = projects || [];

  const defaultArsenal = ['Flutter', 'Kotlin', 'Java', 'PHP', 'Node.js', 'MySQL', 'Next.js', 'React', 'Tailwind CSS'];
  const rawArsenal = profile?.core_arsenal;
  const arsenalToRender = Array.isArray(rawArsenal) && rawArsenal.length > 0 ? rawArsenal : defaultArsenal;
  const displayName = profile?.full_name || 'MH.';

  return (
    // THE FIX: Added md:pr-16 lg:pr-24 to gracefully shift the entire layout to the left
    <main className="min-h-screen pb-32 overflow-hidden md:pr-16 lg:pr-24 relative">
      
      {/* NEW: Injecting the Notion-style Quick Lookup */}
      <QuickNav />
      
      <nav className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center relative z-50">
        <Link href="/" className="flex items-center gap-3 group">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-md group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">MH</div>
          )}
          <span className="font-bold text-xl tracking-tighter bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent group-hover:text-blue-500 transition-colors">
            {displayName}
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <SearchTrigger />
          <ThemeToggle />
        </div>
      </nav>

      {/* ID ADDED: hero */}
      <header id="hero" className="max-w-7xl mx-auto px-6 pt-20 pb-16 relative z-10">
        <div className="max-w-4xl">
           <ScrollReveal delay={0.1}>
             <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-6 bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent drop-shadow-sm">
               Software Developer.
             </h1>
           </ScrollReveal>
           <ScrollReveal delay={0.2}>
             <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed font-medium">
               Building scalable web applications, AI-integrated mobile tools, and intelligent digital experiences.
             </p>
           </ScrollReveal>
        </div>
      </header>

      {/* ID ADDED: about */}
      <section id="about" className="max-w-7xl mx-auto px-6 mb-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollReveal delay={0.1}>
            <SpotlightCard className="md:col-span-2 group h-full">
              <div className="p-8 md:p-10 flex flex-col justify-center h-full">
                  <div className="flex justify-between items-start mb-4">
                     <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">About Me</h2>
                     {profile?.avatar_url && (
                       <img src={profile.avatar_url} alt="Profile" className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/20 shadow-xl object-cover -mt-2 group-hover:scale-105 transition-transform duration-500" />
                     )}
                  </div>
                  <p className="text-2xl md:text-3xl font-medium leading-tight text-gray-900 dark:text-white mb-6 pr-10 relative z-10">
                    I'm {profile?.full_name || 'Mahamud Hasan'}, a final-year B.Sc. Computer Science & Engineering student at IUB, specializing in <span className="text-blue-600 dark:text-blue-400">Full-Stack & Mobile Development</span>.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-lg relative z-10">
                    {profile?.bio || 'I actively partner with international clients to build complete software solutions. I am currently focusing my senior research on Medical Vision AI and modern automation.'}
                  </p>
              </div>
            </SpotlightCard>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <SpotlightCard className="h-full">
              <div className="p-8 md:p-10 flex flex-col items-center justify-center text-center h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mb-6 relative">
                     <div className="w-4 h-4 bg-green-500 rounded-full animate-ping absolute"></div>
                     <div className="w-4 h-4 bg-green-500 rounded-full relative z-10 shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">Available for Work</h3>
                  <p className="text-gray-600 dark:text-gray-400 font-medium relative z-10">Based in Bangladesh.<br/>Working globally.</p>
              </div>
            </SpotlightCard>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <SpotlightCard className="md:col-span-3 h-full">
              <div className="p-8 md:p-10 h-full">
                  <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">Core Arsenal</h2>
                  <div className="flex flex-wrap gap-3 relative z-10">
                     {arsenalToRender.map((tech: string) => (
                        <span key={tech} className="px-5 py-2.5 bg-white/40 dark:bg-black/40 text-gray-900 dark:text-white border border-white/60 dark:border-white/10 rounded-xl font-semibold shadow-sm cursor-default hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors">
                          {tech}
                        </span>
                     ))}
                  </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>
        </div>
      </section>

      {/* ID ADDED: featured */}
      {featuredProjects.length > 0 && (
        <section id="featured" className="max-w-7xl mx-auto px-6 mb-32 relative z-20">
          <ScrollReveal>
            <ProjectSlider projects={featuredProjects} />
          </ScrollReveal>
        </section>
      )}

      {/* ID ADDED: projects */}
      <section id="projects" className="max-w-7xl mx-auto px-6 mb-32 relative z-20">
         <ScrollReveal>
           <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold tracking-tight">All Projects</h2>
           </div>
         </ScrollReveal>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularProjects?.map((project, index) => (
               <ScrollReveal key={project.id} delay={index * 0.1}>
                 <Link href={`/project/${project.id}`} className="block group h-full">
                    <SpotlightCard className="h-full hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-2xl">
                        <div className="p-6 flex flex-col h-full">
                            {project.image_url && (
                              <div className="w-full h-48 rounded-xl overflow-hidden mb-6 relative">
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                                <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              </div>
                            )}
                            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors relative z-10">{project.title}</h3>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed flex-1 relative z-10">
                               <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-auto relative z-10">
                              {project.tech_stack?.slice(0, 3).map((tech: string) => (
                                 <span key={tech} className="px-3 py-1.5 text-xs font-semibold bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg">
                                   {tech}
                                 </span>
                              ))}
                            </div>
                        </div>
                    </SpotlightCard>
                 </Link>
               </ScrollReveal>
            ))}
         </div>
      </section>

      {/* ID ADDED: posts */}
      <section id="posts" className="max-w-7xl mx-auto px-6 mb-32 relative z-20">
         <ScrollReveal>
           <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight">Latest Writings</h2>
           </div>
         </ScrollReveal>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts?.map((post, index) => (
               <ScrollReveal key={post.id} delay={index * 0.1}>
                 <Link href={`/post/${post.slug}`} className="block group h-full">
                    <SpotlightCard className="h-full hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-2xl">
                        <div className="flex flex-col h-full">
                            {post.image_url && (
                              <div className="h-56 w-full overflow-hidden relative">
                                <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              </div>
                            )}
                            <div className="p-8 flex-1 flex flex-col relative z-10">
                               <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors line-clamp-2">{post.title}</h3>
                               <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                               </div>
                               <span className="mt-auto text-xs font-mono font-bold text-gray-400 uppercase tracking-wider group-hover:text-purple-500 transition-colors">
                                 Read Article →
                               </span>
                            </div>
                        </div>
                    </SpotlightCard>
                 </Link>
               </ScrollReveal>
            ))}
         </div>
      </section>

      {/* ID ADDED: contact */}
      <section id="contact" className="max-w-7xl mx-auto px-6 relative z-20">
         <ScrollReveal>
           <SpotlightCard className="rounded-[3rem] group">
              <div className="p-10 md:p-16 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                     <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">Let's build together.</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md font-medium">
                           I'm currently available for freelance projects and full-time roles. Let's get in touch.
                        </p>
                     </div>


                     <div className="flex flex-col gap-4 w-full md:w-auto min-w-[200px]">
                     <a href="mailto:mahamudh48@gmail.com" className="flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-bold hover:bg-blue-600 dark:hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-xl">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Email Me
                     </a>
                     
                     {/* --- Dynamic Social Icons --- */}
                     <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                        
                        {profile?.github_url && (
                          <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/10 rounded-full hover:bg-white/80 dark:hover:bg-white/20 transition-all text-gray-700 dark:text-white group hover:scale-110 shadow-sm">
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                          </a>
                        )}

                        {profile?.linkedin_url && (
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/10 rounded-full hover:bg-white/80 dark:hover:bg-white/20 transition-all text-gray-700 dark:text-white group hover:scale-110 shadow-sm">
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                          </a>
                        )}

                        {profile?.twitter_url && (
                          <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/10 rounded-full hover:bg-white/80 dark:hover:bg-white/20 transition-all text-gray-700 dark:text-white group hover:scale-110 shadow-sm">
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          </a>
                        )}

                        {profile?.facebook_url && (
                          <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/10 rounded-full hover:bg-white/80 dark:hover:bg-white/20 transition-all text-gray-700 dark:text-white group hover:scale-110 shadow-sm">
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                          </a>
                        )}
                        
                        {/* THE FIX: WhatsApp now fully relies on the Database! */}
                        {profile?.whatsapp_url && (
                          <a href={profile.whatsapp_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/10 rounded-full hover:bg-green-500/20 transition-all text-gray-700 dark:text-white group hover:scale-110 shadow-sm hover:text-green-500 dark:hover:text-green-400">
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0c-6.627 0-11.996 5.373-11.996 12 0 2.634.851 5.074 2.298 7.075L.68 24l5.121-1.64c1.942 1.302 4.269 2.062 6.782 2.062 6.627 0 11.996-5.373 11.996-12S18.658 0 12.031 0zm5.669 17.151c-.267.753-1.296 1.393-2.006 1.488-.585.083-1.328.219-4.238-1.026-3.518-1.503-5.787-5.111-5.962-5.345-.175-.234-1.428-1.898-1.428-3.619 0-1.72.883-2.57 1.205-2.92.321-.35.699-.437.933-.437.233 0 .466.002.668.01.203.01.48-.078.751.583.272.661.933 2.277 1.011 2.433.078.156.136.331.02.564-.117.234-.175.38-.35.594-.175.213-.365.46-.505.594-.156.155-.32.33-.136.652.185.321.823 1.362 1.761 2.197 1.205 1.071 2.213 1.394 2.524 1.549.311.156.495.126.68-.088.185-.214.788-.916 1.002-1.228.214-.312.428-.263.719-.156.292.107 1.847.874 2.158 1.03.311.156.515.234.593.36.078.126.078.73-.189 1.483z"/></svg>
                          </a>
                        )}
                     </div>
                     
                  </div>
                  </div>
              </div>
           </SpotlightCard>
         </ScrollReveal>
      </section>

    </main>
  );
}