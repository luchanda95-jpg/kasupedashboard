import { useEffect, useState } from "react";
import "./BlogManagement.css";
import { assets } from "../assets/assets";
import { useAdminAuth } from "../context/AdminAuthContext";
import { adminFetch } from "../utils/adminApi";

// Local demo posts – only used when the API is not available
const demoPosts = [
  {
    id: "demo-1",
    title: "Weekend safari route from Chipata to South Luangwa",
    tag: "Safari route",
    date: "12 Nov 2025",
    readingTime: "5 min read",
    author: "Kasupe Team",
    image: assets.safari1,
    excerpt:
      "A relaxed 3–day loop that starts in Chipata and takes you through some of the best game-viewing routes in Eastern Province.",
    content: [
      "If you are starting your trip from Chipata, a weekend safari to South Luangwa is one of the best ways to experience wildlife without rushing.",
      "Plan to leave early in the morning, fuel up in town and confirm your park entry fees in advance. We recommend an SUV or 4x4 for comfort on the gravel sections.",
      "Always check the road condition in rainy season and keep emergency contacts handy. When in doubt, speak to the Kasupe team for route guidance.",
    ],
  },
  {
    id: "demo-2",
    title: "How to choose the right car for your Zambian road trip",
    tag: "Travel tips",
    date: "03 Oct 2025",
    readingTime: "4 min read",
    author: "Kasupe Team",
    image: assets.safari2,
    excerpt:
      "From compact city cars to rugged SUVs, here is how to decide what to hire based on your route, passengers and luggage.",
    content: [
      "Not every trip needs a 4x4. Sometimes a simple sedan is perfect, especially for city runs and smooth tarmac routes.",
      "For park visits, village detours and rough gravel, we always recommend higher clearance vehicles. Think Fortuner, Pajero or similar SUVs.",
      "If you are unsure, tell us your route, number of people and luggage and we will recommend a suitable vehicle and backup plan.",
    ],
  },
  {
    id: "demo-3",
    title: "Sunrise game drives: tips for first–time visitors",
    tag: "Safari experience",
    date: "21 Sep 2025",
    readingTime: "3 min read",
    author: "Kasupe Team",
    image: assets.safari3,
    excerpt:
      "Early-morning drives can be magical. Here is how to prepare so you stay safe, warm and ready for wildlife sightings.",
    content: [
      "Sunrise drives are often cooler, with more animal activity. Carry a light jacket or blanket for the first hour.",
      "Always respect park rules, keep a safe distance from wildlife and avoid loud noises when viewing animals.",
      "Make sure your vehicle is checked the day before: tyres, fuel, lights and radio/phone signal where possible.",
    ],
  },
];

const emptyForm = {
  title: "",
  tag: "",
  date: "",
  readingTime: "",
  author: "",
  image: "", // text URL (optional)
  excerpt: "",
  contentText: "", // textarea text; we convert to array
};

const getId = (post) => post._id || post.id;

function BlogManagement() {
  const { token } = useAdminAuth();

  const [posts, setPosts] = useState([]);
  const [apiStatus, setApiStatus] = useState("demo"); // 'demo' | 'live'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // blog id or _id
  const [imageFile, setImageFile] = useState(null);

  // ------- Load posts (API if available, otherwise demo data) -------
  useEffect(() => {
    if (!token) return; // ProtectedRoute should ensure token, but just in case

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await adminFetch("/api/admin/blogs", {}, token);

        if (!res.ok) {
          throw new Error("API not ready");
        }

        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
        setApiStatus("live");
      } catch (err) {
        console.warn("Blog API not available, using demo posts.", err);
        setPosts(demoPosts || []);
        setApiStatus("demo");
        setErrorMsg(
          "Blog API not reachable. Showing demo posts only (changes are not saved to a server)."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  const findPostById = (id) => posts.find((p) => getId(p) === id);

  // ------- Form handlers -------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
  };

  const startEdit = (post) => {
    const id = getId(post);
    setEditingId(id);
    setImageFile(null);

    setForm({
      title: post.title || "",
      tag: post.tag || "",
      date: post.date || "",
      readingTime: post.readingTime || "",
      author: post.author || "",
      image: post.image || "",
      excerpt: post.excerpt || "",
      contentText: Array.isArray(post.content)
        ? post.content.join("\n\n")
        : post.content || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    // Convert textarea text to paragraphs
    const contentArray = form.contentText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      tag: form.tag.trim(),
      date: form.date.trim(),
      readingTime: form.readingTime.trim(),
      author: form.author.trim(),
      image: form.image.trim(),
      excerpt: form.excerpt.trim(),
      content: contentArray,
    };

    const isEdit = Boolean(editingId);

    try {
      let savedPost = { ...payload };

      if (apiStatus === "live") {
        const path = isEdit
          ? `/api/admin/blogs/${editingId}`
          : `/api/admin/blogs`;
        const method = isEdit ? "PUT" : "POST";

        const formData = new FormData();

        formData.append("title", payload.title);
        formData.append("tag", payload.tag);
        formData.append("date", payload.date);
        formData.append("readingTime", payload.readingTime);
        formData.append("author", payload.author);
        formData.append("image", payload.image);
        formData.append("excerpt", payload.excerpt);
        formData.append("content", JSON.stringify(payload.content));

        if (imageFile) {
          formData.append("image", imageFile);
        }

        const res = await adminFetch(
          path,
          {
            method,
            body: formData,
          },
          token
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
            errData?.message || "Failed to save blog post via API."
          );
        }

        const data = await res.json();
        savedPost = data;
      } else {
        // Demo mode – local only
        savedPost = {
          ...payload,
          id: isEdit ? editingId : Date.now().toString(),
        };
      }

      setPosts((prev) => {
        if (isEdit) {
          return prev.map((p) =>
            getId(p) === editingId ? { ...p, ...savedPost } : p
          );
        }
        return [savedPost, ...prev];
      });

      resetForm();
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.message ||
          "Could not save blog post. Please check if the API is running."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const post = findPostById(id);
    if (!post) return;

    const confirmDelete = window.confirm(
      `Delete the article "${post.title}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      if (apiStatus === "live") {
        const res = await adminFetch(
          `/api/admin/blogs/${id}`,
          { method: "DELETE" },
          token
        );
        if (!res.ok) throw new Error("Failed to delete via API.");
      }

      setPosts((prev) => prev.filter((p) => getId(p) !== id));

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.message ||
          "Could not delete this blog post. Please check if the API is running."
      );
    }
  };

  const uploadLabel = imageFile ? imageFile.name : "Upload image";

  return (
    <section className="blog-admin-page">
      <header className="blog-admin-header">
        <div>
          <h1>Blog management</h1>
          <p>
            Create, edit and manage Kasupe blog posts used on the public site.
          </p>
        </div>

        <div className="blog-admin-header-right">
          <span className={`blog-admin-badge blog-admin-badge-${apiStatus}`}>
            {apiStatus === "live" ? "API live" : "Demo data (local only)"}
          </span>
        </div>
      </header>

      {errorMsg && <p className="blog-admin-error">{errorMsg}</p>}

      <div className="blog-admin-layout">
        {/* Left: form */}
        <div className="blog-admin-form-card">
          <div className="blog-admin-form-header">
            <h2>{editingId ? "Edit blog post" : "Add new blog post"}</h2>
            {editingId && (
              <button
                type="button"
                className="blog-admin-reset-btn"
                onClick={resetForm}
              >
                + New post
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="blog-admin-form">
            {/* Image picker */}
            <div className="blog-admin-upload-row">
              <label htmlFor="blogImage" className="blog-admin-upload-box">
                <span className="blog-admin-upload-icon">⬆</span>
                <span className="blog-admin-upload-text">{uploadLabel}</span>
                <span className="blog-admin-upload-sub">
                  Upload a thumbnail image for this article
                </span>
                <input
                  id="blogImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  hidden
                />
              </label>
            </div>

            {(form.image || imageFile) && (
              <div className="blog-admin-image-preview">
                <p>Preview:</p>
                <img
                  src={
                    imageFile ? URL.createObjectURL(imageFile) : form.image
                  }
                  alt="Blog thumbnail"
                />
              </div>
            )}

            <div className="blog-admin-two-col">
              <div className="blog-admin-field">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Best routes for a weekend safari from Chipata"
                  required
                />
              </div>

              <div className="blog-admin-field">
                <label>Tag / Category</label>
                <input
                  type="text"
                  name="tag"
                  value={form.tag}
                  onChange={handleChange}
                  placeholder="e.g. Safari route, Travel tips"
                />
              </div>
            </div>

            <div className="blog-admin-two-col">
              <div className="blog-admin-field">
                <label>Date</label>
                <input
                  type="text"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  placeholder="e.g. 12 Nov 2025"
                />
              </div>

              <div className="blog-admin-field">
                <label>Reading time</label>
                <input
                  type="text"
                  name="readingTime"
                  value={form.readingTime}
                  onChange={handleChange}
                  placeholder="e.g. 5 min read"
                />
              </div>
            </div>

            <div className="blog-admin-two-col">
              <div className="blog-admin-field">
                <label>Author</label>
                <input
                  type="text"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  placeholder="e.g. Kasupe Team"
                />
              </div>

              <div className="blog-admin-field">
                <label>Image URL (optional)</label>
                <input
                  type="text"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="e.g. /uploads/safari-1.jpg or full URL"
                />
                <small className="blog-admin-hint">
                  You can upload an image above or paste an existing image URL
                  here.
                </small>
              </div>
            </div>

            <div className="blog-admin-field">
              <label>Short excerpt</label>
              <textarea
                name="excerpt"
                rows="2"
                value={form.excerpt}
                onChange={handleChange}
                placeholder="Short summary that appears on the blog cards."
              />
            </div>

            <div className="blog-admin-field">
              <label>Full content</label>
              <textarea
                name="contentText"
                rows="6"
                value={form.contentText}
                onChange={handleChange}
                placeholder="Write the full article here. Use blank lines between paragraphs."
              />
            </div>

            <div className="blog-admin-form-actions">
              <button
                type="submit"
                className="blog-admin-submit"
                disabled={saving}
              >
                {saving
                  ? editingId
                    ? "Saving..."
                    : "Publishing..."
                  : editingId
                  ? "Save changes"
                  : "Publish post"}
              </button>
            </div>
          </form>
        </div>

        {/* Right: list */}
        <div className="blog-admin-list-card">
          <div className="blog-admin-list-header">
            <h2>Existing posts</h2>
            {loading && <span className="blog-admin-tag">Loading…</span>}
          </div>

          {posts.length === 0 && !loading ? (
            <p className="blog-admin-empty">
              No posts yet. Create your first article on the left.
            </p>
          ) : (
            <ul className="blog-admin-list">
              {posts.map((post) => {
                const id = getId(post);
                const img =
                  post.image ||
                  "https://via.placeholder.com/400x250?text=Kasupe+Blog";

                return (
                  <li key={id} className="blog-admin-item">
                    <div className="blog-admin-item-thumb">
                      <img src={img} alt={post.title} />
                    </div>

                    <div className="blog-admin-item-body">
                      <p className="blog-admin-item-tag-date">
                        {post.tag && <span>{post.tag}</span>}
                        {post.tag && post.date && " · "}
                        {post.date && <span>{post.date}</span>}
                      </p>
                      <h3 className="blog-admin-item-title">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="blog-admin-item-excerpt">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="blog-admin-item-actions">
                        <button
                          type="button"
                          className="blog-admin-item-btn"
                          onClick={() => startEdit(post)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="blog-admin-item-btn danger"
                          onClick={() => handleDelete(id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default BlogManagement;
