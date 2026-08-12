import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil, X, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateProfile } from '../services/userService';
import { toggleLike, deletePost, updatePost } from '../services/postService';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';

const Profile = () => {
  const { id } = useParams();
  const { user: loggedUser, setUser: setLoggedUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isOwnProfile = loggedUser?.id === id;

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await getUserProfile(id);
      setProfileUser(response.data.user);
      setPosts(response.data.posts);
      setName(response.data.user.name);
      setBio(response.data.user.bio || '');
    } catch (err) {
      setError('Erro ao carregar perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await updateProfile(name, bio);
      setProfileUser((prev) => ({ ...prev, name: response.data.name, bio: response.data.bio }));

      const updatedUser = { ...loggedUser, name: response.data.name };
      setLoggedUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setIsEditing(false);
    } catch (err) {
      setError('Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(profileUser.name);
    setBio(profileUser.bio || '');
    setIsEditing(false);
  };

  const handleLike = async (postId) => {
    try {
      await toggleLike(postId);
      setPosts((prev) =>
        prev.map((post) => {
          if (post._id !== postId) return post;
          const alreadyLiked = post.likes.includes(loggedUser.id);
          const updatedLikes = alreadyLiked
            ? post.likes.filter((id) => id !== loggedUser.id)
            : [...post.likes, loggedUser.id];
          return { ...post, likes: updatedLikes };
        })
      );
    } catch (err) {
      setError('Erro ao curtir post.');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (err) {
      setError('Erro ao excluir post.');
    }
  };

  const handleEdit = async (postId, newContent) => {
    try {
      const response = await updatePost(postId, newContent);
      setPosts((prev) => prev.map((post) => (post._id === postId ? response.data : post)));
    } catch (err) {
      setError('Erro ao editar post.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-gray-500">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-500">Usuário não encontrado.</p>
          <Link to="/" className="text-blue-600 hover:underline">Voltar ao feed</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 mb-4">
          <ArrowLeft size={16} /> Voltar ao feed
        </Link>

        {error && (
          <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                {profileUser.name.charAt(0).toUpperCase()}
              </div>

              {!isEditing ? (
                <div>
                  <h1 className="text-xl font-bold">{profileUser.name}</h1>
                  <p className="text-gray-600 text-sm mt-1">
                    {profileUser.bio || 'Sem bio ainda.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    placeholder="Nome"
                  />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm resize-none"
                    placeholder="Bio"
                    rows={2}
                  />
                </div>
              )}
            </div>

            {isOwnProfile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
              >
                <Pencil size={14} /> Editar
              </button>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
              >
                <X size={14} /> Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Check size={14} /> {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold mb-3">
          {isOwnProfile ? 'Meus posts' : `Posts de ${profileUser.name}`}
        </h2>

        {posts.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum post ainda.</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;