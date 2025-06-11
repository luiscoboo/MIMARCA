'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import '../styles/HeaderA.css';

export default function HeaderA() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [customImage, setCustomImage] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/user/${session.user.email}`)
        .then(res => res.json())
        .then(data => {
          setCustomImage(data.image || null);
        });
    }
  }, [session]);

  if (status === 'loading') {
    return <div className="header-container">Cargando...</div>;
  }

  const userInitial = session?.user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="header-container">
      <img
        src="/logo-mimarca.png"
        alt="MIMARCA"
        className="header-logo"
        onClick={() => router.push('/')}
      />
      <button onClick={() => router.push('/settings')} className="header-profile-btn">
        {customImage ? (
          <img src={customImage} alt="Perfil" />
        ) : (
          <span>{userInitial}</span>
        )}
      </button>
    </div>
  );
}
