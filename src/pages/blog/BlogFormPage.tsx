import { useState, useEffect, useRef, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Editor from "../../components/Editor";
import {
  getBlog,
  updateBlog,
  publishBlog,
  unpublishBlog,
  type BlogPayload,
  type BlogStatus,
} from "../../api/blog";
import { uploadImage } from "../../api/uploads";

const EMPTY_FORM: BlogPayload = {
  title: "",
  content: "",
  cover_image_url: "",
};

export default function BlogFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<BlogPayload>(EMPTY_FORM);
  const [editorKey, setEditorKey] = useState(0);
  const [fetching, setFetching] = useState(isEditing);
  const [loading, setLoading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [blogStatus, setBlogStatus] = useState<BlogStatus>("draft");
  const [publishLoading, setPublishLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const coverFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) return;

    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setFetching(true);
      try {
        const { data: blog } = await getBlog(id!);
        if (cancelled) return;
        setForm({
          title: blog.title,
          content: blog.content,
          cover_image_url: blog.cover_image_url,
        });
        setBlogStatus(blog.status);
        setEditorKey((k) => k + 1);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.content.trim() || form.content === "<p></p>") {
      setError("Content is required");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isEditing) {
        await updateBlog(id!, form);
        setSuccess("Post updated successfully");
      } else {
        setSuccess("Post created successfully");
      }
      setTimeout(() => navigate(`/blog`), 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  const set = <K extends keyof BlogPayload>(key: K, value: BlogPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleCoverFile = async (file: File) => {
    setCoverUploading(true);
    try {
      const url = await uploadImage(file);
      set("cover_image_url", url);
    } catch {
      setError("Cover image upload failed. Please try again.");
    } finally {
      setCoverUploading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!id) return;
    setPublishLoading(true);
    setError("");
    try {
      const updated =
        blogStatus === "published"
          ? await unpublishBlog(id)
          : await publishBlog(id);
      setBlogStatus(updated.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setPublishLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="page">
        <div className="loading">
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className="spin"
            style={{ marginRight: 8 }}
          >
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/blog" className="btn btn--ghost btn--sm">
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 12H5M12 5l-7 7 7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <h1 className="page-title">{isEditing ? "Edit Post" : "New Post"}</h1>
        </div>
        {isEditing && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className={`btn btn--sm ${blogStatus === "published" ? "btn--secondary" : "btn--primary"}`}
              onClick={handlePublishToggle}
              disabled={publishLoading}
            >
              {publishLoading
                ? "..."
                : blogStatus === "published"
                  ? "Unpublish"
                  : "Publish"}
            </button>
            <Link
              to={`/blog/${id}/preview`}
              className="btn btn--secondary btn--sm"
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Preview
            </Link>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="blog-form">
        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <div className="card">
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="title">
              Title *
            </label>
            <input
              id="title"
              type="text"
              className="form-input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Enter post title..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content *</label>
            <Editor
              key={editorKey}
              value={form.content}
              onChange={(v) => set("content", v)}
              placeholder="Start writing your post content..."
            />
          </div>
        </div>

        <div className="card">
          <h2 className="card-section-title">Post Settings</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cover Image</label>
              <input
                ref={coverFileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverFile(file);
                  e.target.value = "";
                }}
              />
              <div
                className={`cover-upload-zone${form.cover_image_url ? " cover-upload-zone--filled" : ""}`}
                onClick={() => !coverUploading && coverFileRef.current?.click()}
              >
                {form.cover_image_url && (
                  <img
                    src={form.cover_image_url}
                    alt="Cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                {coverUploading ? (
                  <div className="cover-upload-zone__status">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      className="spin"
                    >
                      <path
                        d="M21 12a9 9 0 1 1-6.219-8.56"
                        strokeLinecap="round"
                      />
                    </svg>
                    Uploading...
                  </div>
                ) : !form.cover_image_url ? (
                  <div className="cover-upload-zone__status">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle
                        cx="8.5"
                        cy="8.5"
                        r="1.5"
                        fill="currentColor"
                        stroke="none"
                      />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Click to upload cover image</span>
                  </div>
                ) : (
                  <div className="cover-upload-zone__overlay">
                    <button
                      type="button"
                      className="cover-upload-zone__action"
                      onClick={(e) => {
                        e.stopPropagation();
                        coverFileRef.current?.click();
                      }}
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      className="cover-upload-zone__action cover-upload-zone__action--remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        set("cover_image_url", "");
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <div style={{ paddingTop: 6 }}>
                <span className={`badge badge--${blogStatus}`}>
                  {blogStatus === "published" ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
          </button>
          <Link to="/blog" className="btn btn--secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
