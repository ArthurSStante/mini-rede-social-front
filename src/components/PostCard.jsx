import { useState } from "react";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CommentSection from "./CommentSection";
import ConfirmModal from "./ConfirmModal";
import { Link } from "react-router-dom";

const PostCard = ({ post, onLike, onDelete, onEdit }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const isLiked = post.likes.includes(user?.id);
  const isOwner = post.author?._id === user?.id;

  const handleLikeClick = () => {
    onLike(post._id);
    setAnimateHeart(true);
    setTimeout(() => setAnimateHeart(false), 300);
  };

  const handleConfirmDelete = () => {
    onDelete(post._id);
    setShowDeleteModal(false);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    onEdit(post._id, editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(post.content);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          {post.author ? (
            <Link
              to={`/perfil/${post.author._id}`}
              className="font-semibold hover:underline"
            >
              {post.author.name}
            </Link>
          ) : (
            <p className="font-semibold">Usuário removido</p>
          )}
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>

        {isOwner && !isEditing && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1 text-xs text-red-500 hover:underline"
            >
              <Trash2 size={14} /> Excluir
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mb-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1 text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
            >
              <X size={14} /> Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-1 text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              <Check size={14} /> Salvar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 mb-3">{post.content}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleLikeClick}
          className={`text-sm flex items-center gap-1 ${
            isLiked ? "text-red-600" : "text-gray-500"
          } hover:text-red-600`}
        >
          <span
            className={
              animateHeart ? "animate-heart-pop inline-block" : "inline-block"
            }
          >
            {isLiked ? "❤️" : "🤍"}
          </span>
          {post.likes.length}
        </button>

        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="text-sm text-gray-500 hover:text-blue-600"
        >
          💬 {showComments ? "Ocultar comentários" : "Ver comentários"}
        </button>
      </div>

      {showComments && <CommentSection postId={post._id} />}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Excluir post"
        message="Tem certeza que deseja excluir este post? Essa ação não pode ser desfeita."
        confirmText="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default PostCard;
