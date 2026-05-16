import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '../../components/Editor';
import { getBlog, createBlog, updateBlog, type BlogPayload, type BlogStatus } from '../../api/blog';

const EMPTY_FORM: BlogPayload = {
  title: '',
  content: '',
  cover_image_url: '',
  status: 'draft',
};

export default function BlogFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<BlogPayload>(EMPTY_FORM);
  const [editorKey, setEditorKey] = useState(0);
  const [fetching, setFetching] = useState(isEditing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    setFetching(true);
    getBlog(id!)
      .then(blog => {
        setForm({
          title: blog.title,
          content: blog.content,
          cover_image_url: blog.cover_image_url,
          status: blog.status,
        });
        setEditorKey(k => k + 1);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load post'))
      .finally(() => setFetching(false));
  }, [id, isEditing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.content.trim() || form.content === '<p></p>') { setError('Content is required'); return; }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isEditing) {
        await updateBlog(id!, form);
        setSuccess('Post updated successfully');
      } else {
        const created = await createBlog(form);
        setSuccess('Post created successfully');
        setTimeout(() => navigate(`/blog/${created.id}/edit`), 800);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const set = <K extends keyof BlogPayload>(key: K, value: BlogPayload[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  if (fetching) {
    return (
      <div className="page">
        <div className="loading">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="spin" style={{ marginRight: 8 }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
          </svg>
          Loading post...
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/blog" className="btn btn--ghost btn--sm">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="page-title">{isEditing ? 'Edit Post' : 'New Post'}</h1>
        </div>
        {isEditing && (
          <Link to={`/blog/${id}/preview`} className="btn btn--secondary btn--sm">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="blog-form">
        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <div className="card">
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              className="form-input"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Enter post title..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content *</label>
            <Editor
              key={editorKey}
              value={form.content}
              onChange={v => set('content', v)}
              placeholder="Start writing your post content..."
            />
          </div>
        </div>

        <div className="card">
          <h2 className="card-section-title">Post Settings</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="cover_image_url">Cover Image URL</label>
              <input
                id="cover_image_url"
                type="url"
                className="form-input"
                value={form.cover_image_url}
                onChange={e => set('cover_image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="status">Status</label>
              <select
                id="status"
                className="form-select"
                value={form.status}
                onChange={e => set('status', e.target.value as BlogStatus)}
              >
                <option value="draft">Draft</option>
                <option value="publish">Published</option>
              </select>
            </div>
          </div>

          {form.cover_image_url && (
            <div style={{ marginTop: 16 }}>
              <p className="form-label" style={{ marginBottom: 8 }}>Cover Preview</p>
              <img
                src={form.cover_image_url}
                alt="Cover preview"
                className="cover-preview-img"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
          </button>
          <Link to="/blog" className="btn btn--secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
