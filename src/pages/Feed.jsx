import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getPosts,
  createPost,
  toggleLike,
  deletePost,
} from "../services/postService";
import { LogOut } from "lucide-react";
import PostCard from "../components/PostCard";
import AvatarUpload from "../components/AvatarUpload";
import ConfirmModal from "../components/ConfirmModal";

const Feed = () => {
  const { user, logout } = useAuth();

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchPosts = async (pageNumber = 1) => {
    setLoadingPosts(true);
    try {
      const response = await getPosts(pageNumber);
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
      setPage(pageNumber);
    } catch (err) {
      setError("Erro ao carregar posts.");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      await createPost(content);
      setContent("");
      fetchPosts(1); // volta pra primeira página pra ver o post novo
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar post.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await toggleLike(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id !== postId) return post;

          const alreadyLiked = post.likes.includes(user.id);
          const updatedLikes = alreadyLiked
            ? post.likes.filter((id) => id !== user.id)
            : [...post.likes, user.id];

          return { ...post, likes: updatedLikes };
        }),
      );
    } catch (err) {
      setError("Erro ao curtir post.");
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (err) {
      setError("Erro ao excluir post.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Feed</h1>
          <div className="flex items-center gap-4">
            <AvatarUpload />
            <span className="text-sm text-gray-600">Olá, {user?.name}</span>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-1 text-sm text-red-600 hover:underline"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>

        {error && (
          <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">
            {error}
          </p>
        )}

        <form
          onSubmit={handleCreatePost}
          className="bg-white rounded-lg shadow p-4 mb-6"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="No que você está pensando?"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Publicando..." : "Publicar"}
          </button>
        </form>

        {loadingPosts ? (
          <p className="text-center text-gray-500">Carregando posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">
            Nenhum post ainda. Seja o primeiro!
          </p>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onDelete={handleDelete}
              />
            ))}

            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => fetchPosts(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 bg-white rounded shadow disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => fetchPosts(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 bg-white rounded shadow disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </>
        )}
        <ConfirmModal
          isOpen={showLogoutModal}
          title="Sair da conta"
          message="Tem certeza que deseja sair?"
          confirmText="Sair"
          onConfirm={logout}
          onCancel={() => setShowLogoutModal(false)}
        />
      </div>
    </div>
  );
};

export default Feed;
