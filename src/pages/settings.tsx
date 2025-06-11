'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/Settings.css';

export default function Settings() {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [idPublico, setIdPublico] = useState<string>('');

  useEffect(() => {
    if (session) {
      fetch(`/api/user/${session.user?.email}`)
        .then(res => res.json())
        .then(data => {
          setName(data.name || '');
          setImage(data.image || '');
          setPreview(data.image || null);
          setIdPublico(data.id_publico || '');
        });
    }
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(image || null);
    }
  };

  const save = async () => {
    if (!session?.user?.email) return;

    const userRes = await fetch(`/api/user/${session.user.email}`);
    const userData = await userRes.json();

    const formData = new FormData();
    formData.append('name', name);
    if (file) formData.append('file', file);
    formData.append('weight', userData.weight || '');
    formData.append('fat_percentage', userData.fat_percentage || '');

    await fetch(`/api/user/${session.user.email}`, {
      method: 'PUT',
      body: formData,
    });

    alert('Datos guardados');
  };

  if (!session) {
    return (
      <div className="container">
        <button onClick={() => router.push('/')}>Volver al Inicio</button>
      </div>
    );
  }

  const userInitial = session.user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="container">
      <div className="top-bar">
        <img
          src="/logo-mimarca.png"
          alt="MIMARCA"
          className="logo clickable"
          onClick={() => router.push('/')}
        />
      </div>

      <h1 className="title">Configuración de Perfil</h1>

      <div className="settings-content">
        <div className="profile-section">
          {preview ? (
            <img src={preview} alt="Preview" className="profile-img" />
          ) : (
            <div className="profile-placeholder">{userInitial}</div>
          )}
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
          <label htmlFor="fileInput" className="file-label">Cambiar Foto</label>
        </div>

        <div className="name-section">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Tu nombre"
            className="name-input"
          />
          <button onClick={save} className="edit-btn">Guardar Cambios</button>
        </div>

        {/* ✅ Mostrar ID público */}
        <div className="public-id-box">
          <p>Tu ID público para compartir:</p>
          <div className="public-id">
            <span>{idPublico}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(idPublico);
                alert('ID copiado al portapapeles');
              }}
              className="copy-id-btn"
            >
              Copiar
            </button>
          </div>
        </div>

        {/* ✅ Botón de cerrar sesión */}
        <div className="logout-section">
          <button onClick={() => signOut({ callbackUrl: '/' })} className="logout-btn">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
