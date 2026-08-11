import { useState, useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AvatarUpload = () => {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef(null);

  const storageKey = `avatar_${user?.id}`;

  useEffect(() => {
    const savedAvatar = localStorage.getItem(storageKey);
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, [storageKey]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Imagem muito grande. Escolha uma de até 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      localStorage.setItem(storageKey, base64);
      setAvatar(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="relative group cursor-pointer"
      onClick={() => fileInputRef.current.click()}
    >
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow">
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-blue-600 font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
        <Camera size={16} className="text-white" />
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;
