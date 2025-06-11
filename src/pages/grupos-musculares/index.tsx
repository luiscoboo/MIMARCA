'use client';
import { useRouter } from 'next/navigation';
import '../../styles/GruposMusculares.css';
import HeaderA from '../../components/HeaderA'; // 👈 Usa tu header real

export default function GruposMusculares() {
  const router = useRouter();

  const grupos = [
    { nombre: 'Pectoral', imagen: '/pecho.png', ruta: 'pecho' },
    { nombre: 'Espalda', imagen: '/espalda.png', ruta: 'espalda' },
    { nombre: 'Pierna', imagen: '/pierna.png', ruta: 'piernas' },
    { nombre: 'Hombro', imagen: '/hombros.png', ruta: 'hombros' },
    { nombre: 'Brazo', imagen: '/brazo.png', ruta: 'brazos' },
  ];

  return (
    <div className="grupos-container">
      <HeaderA /> {/* ✅ Encabezado coherente */}
      
      <h1 className="titulo">Selecciona el grupo muscular</h1>
      
      <div className="grupos-lista">
        {grupos.map((grupo) => (
          <div
            key={grupo.ruta}
            className="grupo-card"
            onClick={() => router.push(`/grupos-musculares/${grupo.ruta}`)}
          >
            <img src={grupo.imagen} alt={grupo.nombre} className="grupo-imagen" />
            <div className="grupo-nombre">{grupo.nombre.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
