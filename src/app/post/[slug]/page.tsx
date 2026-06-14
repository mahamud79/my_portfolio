import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import ThemeToggle from '../../../components/ThemeToggle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // <-- NEW: Import GitHub Flavored Markdown

export const dynamic = 'force-dynamic';

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <p className="text-gray-500 mb-8 font-mono">We looked for a slug named: {slug}</p>
        <Link href="/" className="text-blue-500 hover:underline">← Back to Home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen transition-colors duration-300 pb-32">
      
      <nav className="w-full max-w-3xl mx-auto p-6 flex justify-between items-center mb-8">
        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-foreground transition flex items-center gap-2">
          ← Back to Portfolio
        </Link>
        <ThemeToggle />
      </nav>

      <article className="max-w-3xl mx-auto px-6">
        <header className="mb-10 text-center">
          <div className="text-sm text-purple-500 font-mono mb-4">
            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 leading-tight">
            {post.title}
          </h1>
          
          {post.image_url && (
            <div className="w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl relative border border-border">
              <img 
                src={post.image_url} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </header>

        {/* FIXED: Uses dark:prose-invert so text is black in light mode and white in dark mode */}
        <div className="prose dark:prose-invert prose-lg max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500">
           <ReactMarkdown remarkPlugins={[remarkGfm]}>
             {post.content}
           </ReactMarkdown>
        </div>

      </article>
    </main>
  );
}