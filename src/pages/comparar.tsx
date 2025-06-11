'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../styles/Comparar.css';
import HeaderA from '../components/HeaderA';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type RadarPoint = {
  grupo: string;
  valorTuyo: number;
  valorOtro?: number;
};

export default function Comparar() {
  const { data: session } = useSession();
  const router = useRouter();

  const [miProgreso, setMiProgreso] = useState<Record<string, number>>({});
  const [miIdPublico, setMiIdPublico] = useState('');
  const [otraProgreso, setOtraProgreso] = useState<Record<string, number> | null>(null);
  const [grafica, setGrafica] = useState<RadarPoint[]>([]);
  const [idComparar, setIdComparar] = useState('');
  const [nombreComparado, setNombreComparado] = useState('');

  // Cargar TU PROGRESO
  useEffect(() => {
    if (session?.user?.email) {
      // Cargar progreso personal
      fetch(`/api/progreso?email=${session.user.email}`)
        .then(res => res.json())
        .then(data => {
          setMiProgreso(data);
          setOtraProgreso(null);
          generarGrafica(data, null);
        });

      // Cargar ID público del usuario actual
      fetch(`/api/user/${session.user.email}`)
        .then(res => res.json())
        .then(user => {
          setMiIdPublico(user.id_publico);
        });
    }
  }, [session]);

  const generarGrafica = (
    tuProgreso: Record<string, number>,
    otroProgreso: Record<string, number> | null
  ) => {
    const gruposFijos = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos'];

    const combinada: RadarPoint[] = gruposFijos.map(grupo => ({
      grupo,
      valorTuyo: Number(tuProgreso[grupo]) || 0,
      valorOtro: otroProgreso ? Number(otroProgreso[grupo]) || 0 : undefined,
    }));

    setGrafica(combinada);
  };

  // AL COMPARAR
  const comparar = async () => {
    const idTrimmed = idComparar.trim();
    if (!idTrimmed) return;

    if (idTrimmed === miIdPublico) {
      alert('❌ No puedes comparar contigo mismo.');
      return;
    }

    const res = await fetch(`/api/progreso/usuario?id_publico=${idTrimmed}`);
    const data = await res.json();

    if (data && data.nombre && data.grafica) {
      setNombreComparado(data.nombre);
      setOtraProgreso(data.grafica);
      generarGrafica(miProgreso, data.grafica);
    } else {
      alert('❌ No se encontró ningún usuario con ese ID.');
    }
  };

  return (
    <div className="comparar-container">
      <HeaderA />
      <h1>Comparar Progreso Muscular</h1>

      <input
        type="text"
        value={idComparar}
        onChange={e => setIdComparar(e.target.value)}
        placeholder="ID público del usuario"
        className="comparar-input"
      />
      <button onClick={comparar} className="comparar-btn">Comparar</button>

      {grafica.length > 0 && (
        <div className="grafica-comparar">
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={grafica}>
              <PolarGrid />
              <PolarAngleAxis dataKey="grupo" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar
                name="Tú"
                dataKey="valorTuyo"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.4}
              />
              {otraProgreso && (
                <Radar
                  name={nombreComparado}
                  dataKey="valorOtro"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.4}
                />
              )}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
