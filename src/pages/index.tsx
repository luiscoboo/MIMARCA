'use client';

import '../styles/Home.css';
import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderA from '../components/HeaderA';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

type RadarPoint = {
  grupo: string;
  valor: number;
};

const GRUPOS_MUSCULARES_BASE: RadarPoint[] = [
  { grupo: 'Pecho', valor: 0 },
  { grupo: 'Espalda', valor: 0 },
  { grupo: 'Piernas', valor: 0 },
  { grupo: 'Hombros', valor: 0 },
  { grupo: 'Brazos', valor: 0 },
];

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const [weight, setWeight] = useState('');
  const [fat, setFat] = useState('');
  const [image, setImage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [radarData, setRadarData] = useState<RadarPoint[]>(GRUPOS_MUSCULARES_BASE);
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    if (!session) return;

    fetch(`/api/user/${session.user?.email}`)
      .then(res => res.json())
      .then(data => {
        setWeight(data.weight || '');
        setFat(data.fat_percentage || '');
        setImage(data.image || '');
        setUserName(data.name || 'Usuario');
      });

    fetch(`/api/progreso?email=${session.user?.email}`)
      .then(res => res.json())
      .then((data: Record<string, number>) => {
        if (!data || Object.keys(data).length === 0) {
          setRadarData(GRUPOS_MUSCULARES_BASE);
          return;
        }

        // Construimos radar con todos los grupos, rellenando con 0 si falta alguno
        const combinado = GRUPOS_MUSCULARES_BASE.map(base => ({
          grupo: base.grupo,
          valor: Number(data[base.grupo]) || 0,
        }));

        setRadarData(combinado);
      })
      .catch(err => {
        console.error('Error al obtener el progreso muscular:', err);
        setRadarData(GRUPOS_MUSCULARES_BASE); // fallback seguro
      });
  }, [session]);

  const save = async () => {
    const formData = new FormData();
    formData.append('weight', weight);
    formData.append('fat_percentage', fat);

    await fetch(`/api/user/${session?.user?.email}`, {
      method: 'PUT',
      body: formData,
    });

    const res = await fetch(`/api/user/${session?.user?.email}`);
    const data = await res.json();
    setImage(data.image || '');
    setWeight(data.weight || '');
    setFat(data.fat_percentage || '');

    alert('Datos guardados');
    setShowModal(false);
  };




  if (!session) {
  return (
    <div className="login-wrapper">
      <div className="login-overlay">
        <img src="/logoblanco.png" alt="MiMarca" className="logo-top" />

        <div className="login-card">
          <img src="/icono-mimarca.png" alt="Icono MiMarca" className="icono-verde" />

          <h2 className="inicia-texto">Tu marca empieza aquí</h2>

          <button onClick={() => signIn('google')} className="login-btn">
            Inicia sesión con Google
          </button>

          <p className="frase-impacto">¡Convierte el esfuerzo en resultados!</p>
        </div>

        <footer className="footer-login">© MiMarca 2025</footer>
      </div>
    </div>
  );
}








  return (
    <div className="container">
      <HeaderA />
      <h1 className="title">Tu resumen de Marca {userName}</h1>

      <div className="radar-container">
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#888" />
              <PolarAngleAxis dataKey="grupo" tick={{ fill: 'black', fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} />
              <Radar
                name="Progreso"
                dataKey="valor"
                stroke="#27D367"
                fill="#27D367"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-container">
        <div className="card">
          <span>PESO EN KG:</span>
          <span>{weight || '0'}KG</span>
        </div>
        <div className="card">
          <span>PORCENTAJE GRASA:</span>
          <span>{fat || '0'}%</span>
        </div>
      </div>

      <button onClick={() => setShowModal(true)} className="edit-btn">
        EDITAR MEDIDA
      </button>

      <button
        onClick={() => router.push('/comparar')}
        className="compare-btn"
        style={{ marginTop: '10px', padding: '0.6rem 1.2rem', fontWeight: 'bold' }}
      >
        Comparar progreso
      </button>

      <div className="bottom-buttons">
        <button onClick={() => router.push('/grupos-musculares')}>Añadir marca +</button>
        <button onClick={() => router.push('/ver-marcas')}>Ver Marcas</button>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editar Medidas</h2>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="Peso (kg)"
            /><br />
            <input
              type="number"
              value={fat}
              onChange={e => setFat(e.target.value)}
              placeholder="Porcentaje de grasa"
            /><br />
            <button onClick={save}>Guardar</button>
            <button onClick={() => setShowModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

