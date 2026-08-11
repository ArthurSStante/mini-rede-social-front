import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getComments,
  createComment,
  deleteComment,
} from "../services/commentService";
import { Trash2 } from "lucide-react";

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Erro ao excluir comentário:", err);
    }
  };

  return (
    <div className="mt-3 border-t pt-3">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva um comentário..."
          className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <p className="text-xs text-gray-500">Carregando comentários...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-500">Nenhum comentário ainda.</p>
      ) : (
        comments.map((comment) => (
          <div
            key={comment._id}
            className="flex justify-between items-start text-sm mb-2"
          >
            <div>
              <span className="font-semibold">
                {comment.author?.name || "Usuário removido"}
              </span>{" "}
              <span className="text-gray-700">{comment.content}</span>
            </div>
            {comment.author?._id === user?.id && (
              <button
                onClick={() => handleDelete(comment._id)}
                className="flex items-center gap-1 text-xs text-red-500 hover:underline ml-2"
              >
                <Trash2 size={12} /> Excluir
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default CommentSection;
