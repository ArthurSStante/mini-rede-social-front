import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CommentSection from "./CommentSection";
import ConfirmModal from "./ConfirmModal";

const PostCard = ({ post, onLike, onDelete }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold">
            {post.author?.name || "Usuário removido"}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1 text-xs text-red-500 hover:underline"
          >
            <Trash2 size={14} /> Excluir
          </button>
        )}
      </div>

      <p className="text-gray-800 mb-3">{post.content}</p>

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
