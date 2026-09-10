import { useEffect, useState } from "react";
import { User } from "lucide-react";
import apiClient from "../services/api";

export default function ProfileAvatar({ className = "h-10 w-10", preview }) {
  const [photo, setPhoto] = useState("");
  useEffect(() => {
    let active = true;
    let objectUrl;
    let generation = 0;
    const load = async () => {
      const current = ++generation;
      try {
        const profile = await apiClient.get('/me/profile');
        if (!profile.data.photo?.startsWith('avatars/')) return;
        const response = await apiClient.get('/me/profile/photo', { responseType: 'blob' });
        if (!active || current !== generation) return;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = URL.createObjectURL(response.data);
        setPhoto(objectUrl);
      } catch { /* Keep the default avatar when a photo cannot be loaded. */ }
    };
    load();
    window.addEventListener('profile-updated', load);
    return () => {
      active = false;
      window.removeEventListener('profile-updated', load);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);
  return <span className={`${className} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500`}>
    {preview || photo ? <img src={preview || photo} alt="Profile" className="h-full w-full object-cover" /> : <User className="h-1/2 w-1/2" />}
  </span>;
}
