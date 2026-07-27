"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { database, ref, get } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

const CR = '#8B1A1A', LCR = '#C41E3A', CREAM = '#F5F0E8', DK = '#1A0808', WM = '#6B5045';
const HF = "'Playfair Display', serif";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Noto+Serif+Bengali:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }

  .pi    { animation: fadeIn .38s ease both; }

  .blog-content {
    line-height: 1.8;
    font-size: 16px;
    color: #2B1B18;
  }

  .blog-content p {
    margin-bottom: 1.5em;
  }

  .blog-content h2 {
    font-family: ${HF};
    font-size: 28px;
    font-weight: 700;
    color: ${DK};
    margin: 2em 0 1em;
    line-height: 1.3;
  }

  .blog-content h3 {
    font-family: ${HF};
    font-size: 22px;
    font-weight: 600;
    color: ${DK};
    margin: 1.5em 0 0.75em;
    line-height: 1.4;
  }

  .blog-content ul, .blog-content ol {
    margin: 1.5em 0;
    padding-left: 1.5em;
  }

  .blog-content li {
    margin-bottom: 0.5em;
  }

  .blog-content strong {
    color: ${CR};
    font-weight: 600;
  }

  .blog-content a {
    color: ${CR};
    text-decoration: underline;
  }

  .blog-content blockquote {
    border-left: 4px solid ${CR};
    padding-left: 1.5em;
    margin: 1.5em 0;
    font-style: italic;
    color: ${WM};
  }

  @media (max-width: 768px) {
    .blog-content {
      font-size: 15px;
    }

    .blog-content h2 {
      font-size: 24px;
    }

    .blog-content h3 {
      font-size: 20px;
    }
  }
`;

export default function BlogPostPage() {
  const { language } = useLanguage();
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    if (language && (language === 'en' || language === 'bn')) {
      setCurrentLang(language);
    }
  }, [language]);

  useEffect(() => {
    if (params.id) {
      fetchBlogPost(params.id as string);
    }
  }, [params.id, currentLang]);

  const fetchBlogPost = async (id: string) => {
    try {
      if (!database) return;

      const blogRef = ref(database, `blogPosts/${id}`);
      const snapshot = await get(blogRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        setPost({
          id,
          ...data
        });
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const bf = currentLang === 'bn' ? "'Noto Serif Bengali',serif" : "'DM Sans',serif";

  if (loading) {
    return (
      <div style={{ fontFamily: bf, background: CREAM, minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: CR }}></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ fontFamily: bf, background: CREAM, minHeight: '100vh' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: HF, fontSize: 32, fontWeight: 900, color: DK, marginBottom: 16 }}>
            Blog Post Not Found
          </h1>
          <Link href="/blog" style={{ color: CR, textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const title = currentLang === 'bn' ? post.titleBn || post.title : post.title;
  const content = currentLang === 'bn' ? post.contentBn || post.content : post.content;
  const category = currentLang === 'bn' ? post.categoryBn || post.category : post.category;
  const date = post.date || new Date(post.createdAt).toISOString().split('T')[0];
  const backText = currentLang === 'bn' ? '← ব্লগে ফিরুন' : '← Back to Blog';

  return (
    <div style={{ fontFamily: bf, background: CREAM, minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pi">
        {/* Header */}
        <div style={{ background: 'linear-gradient(148deg,#3D0808 0%,#8B1A1A 65%,#9C2020 100%)', padding: '60px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Link 
              href="/blog" 
              style={{ 
                color: 'rgba(255,210,210,0.72)', 
                fontSize: 14, 
                marginBottom: 20, 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 8,
                textDecoration: 'none' 
              }}
            >
              <ArrowLeft size={16} />
              {backText}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, marginBottom: 16 }}>
              <span style={{ 
                fontSize: 11, 
                fontWeight: 800, 
                letterSpacing: '0.26em', 
                textTransform: 'uppercase',
                color: 'rgba(255,200,200,0.78)',
                background: 'rgba(255,255,255,0.1)',
                padding: '6px 14px',
                borderRadius: '20px'
              }}>
                {category}
              </span>
              <span style={{ 
                fontSize: 12, 
                color: 'rgba(255,215,215,0.72)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6 
              }}>
                <Calendar size={14} />
                {date}
              </span>
            </div>
            <h1 style={{ 
              fontFamily: HF, 
              fontSize: 'clamp(28px,5vw,48px)', 
              fontWeight: 900, 
              color: 'white', 
              lineHeight: 1.15,
              marginBottom: 16
            }}>
              {title}
            </h1>
            {post.author && (
              <p style={{ color: 'rgba(255,215,215,0.72)', fontSize: 14 }}>
                By {post.author}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ background: CREAM }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
