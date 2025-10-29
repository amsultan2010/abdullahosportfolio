import { FaRegFolderClosed } from 'react-icons/fa6';

interface BlogPost {
  title: string;
  slug: string | undefined;
  summary: string;
  publishedAt: string;
  readingTime?: number;
  tags: string[];
}

interface BlogPostCardProps {
  post: BlogPost;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const filename = post.slug || 'untitled';
  
  return (
    <a
      href={`/blog/${filename}`}
      className="block glass rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
    >
      {/* Terminal Title Bar */}
      <div className="h-6 flex items-center space-x-2 px-4 border-b border-white/10">
        <div className="w-3 h-3 rounded-full bg-red-500 group-hover:bg-red-400 transition-colors"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500 group-hover:bg-yellow-400 transition-colors"></div>
        <div className="w-3 h-3 rounded-full bg-green-500 group-hover:bg-green-400 transition-colors"></div>
        <span className="text-sm text-gray-200 flex-grow text-center font-semibold flex items-center justify-center gap-2">
          <FaRegFolderClosed size={14} className="text-gray-200" />
          {filename}.md — blog
        </span>
      </div>

      {/* Terminal Content */}
      <div className="p-6 text-gray-200 font-mono text-sm">
        {/* Title */}
        <div className="mb-3">
          <h2 className="text-base font-bold text-white group-hover:text-green-400 transition-colors">
            {post.title}
          </h2>
        </div>

        {/* Summary */}
        <p className="text-gray-300 leading-relaxed mb-4 font-sans">
          {post.summary}
        </p>

        {/* Tags */}
        <div className="tag-list flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span key={index} className="pill">
              #{tag}
            </span>
          ))}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-700/50">
          <span className="flex items-center space-x-2">
            <span className="text-green-400">$</span>
            <span>published {formatDate(post.publishedAt)}</span>
          </span>
          {post.readingTime && (
            <span className="text-gray-500">
              {post.readingTime} min read
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
