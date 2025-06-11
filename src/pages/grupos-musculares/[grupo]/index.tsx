'use client';
import { useRouter } from 'next/router'; // ✅ para pages/
import '../../../styles/GrupoPage.css';
import HeaderA from '../../../components/HeaderA'; // ✅ importar encabezado

export default function GrupoPage() {
  const router = useRouter();
  const grupo = router.query.grupo as string;

  const ejercicios = {
    pecho: ['Press Banca', 'Press Inclinado', 'Aperturas', 'Fondos', 'Pullover'],
    espalda: ['Dominadas', 'Remo', 'Peso muerto', 'Pulldown', 'Remo invertido'],
    piernas: ['Sentadilla', 'Prensa', 'Extensiones', 'Curl femoral', 'Zancadas'],
    hombros: ['Press militar', 'Elevaciones laterales', 'Elevaciones frontales', 'Pájaros', 'Facepull'],
    brazos: ['Curl bíceps', 'Curl martillo', 'Extensión tríceps', 'Fondos banco', 'Curl concentrado'],
  };

  if (!grupo || !ejercicios[grupo as keyof typeof ejercicios]) {
    return (
      <div className="container">
        <HeaderA />
        <p>Grupo no válido o no cargado.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <HeaderA /> {/* ✅ Mostrar encabezado */}
      <h1 className="title">Ejercicios de {grupo}</h1>
      <ul className="list">
        {ejercicios[grupo as keyof typeof ejercicios].map((ej) => (
          <li
            key={ej}
            onClick={() =>
              router.push(`/grupos-musculares/${grupo}/${ej.replace(/\s+/g, '-').toLowerCase()}`)
            }
            className="list-item"
          >
            {ej}
          </li>
        ))}
      </ul>
    </div>
  );
}
