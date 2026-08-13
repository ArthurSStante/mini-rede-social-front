import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getComments,
  createComment,
  deleteComment,
} from "../services/commentService";
import ConfirmModal from "./ConfirmModal";

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await getComments(postId);
      setComments(response.data);
    } catch (err) {
      console.error("Erro ao buscar comentários:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const response = await createComment(postId, content);
      setComments((prev) => [response.data, ...prev]);
      setContent("");
    } catch (err) {
      console.error("Erro ao criar comentário:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteComment(commentToDelete);
      setComments((prev) => prev.filter((c) => c._id !== commentToDelete));
    } catch (err) {
      console.error("Erro ao excluir comentário:", err);
    } finally {
      setCommentToDelete(null);
    }
  };

  return (
    <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva um comentário..."
          className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Nenhum comentário ainda.
        </p>
      ) : (
        comments.map((comment) => (
          <div
            key={comment._id}
            className="flex justify-between items-start text-sm mb-2"
          >
            <div>
              {comment.author ? (
                <Link
                  to={`/perfil/${comment.author._id}`}
                  className="font-semibold text-gray-900 dark:text-white hover:underline"
                >
                  {comment.author.name}
                </Link>
              ) : (
                <span className="font-semibold text-gray-900 dark:text-white">
                  Usuário removido
                </span>
              )}{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {comment.content}
              </span>
            </div>
            {comment.author?._id === user?.id && (
              <button
                onClick={() => setCommentToDelete(comment._id)}
                className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:underline ml-2"
              >
                <Trash2 size={12} /> Excluir
              </button>
            )}
          </div>
        ))
      )}

      <ConfirmModal
        isOpen={!!commentToDelete}
        title="Excluir comentário"
        message="Tem certeza que deseja excluir este comentário?"
        confirmText="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setCommentToDelete(null)}
      />
    </div>
  );
};

export default CommentSection;
