'use client';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import HeaderA from '../../../components/HeaderA';
import '../../../styles/EjercicioPage.css';


type Marca = {
  id: number;
  weight: number;
  reps: number;
  fallo: boolean;
};

export default function EjercicioPage() {
  const router = useRouter();
  const params = useParams();
  const grupo = (params as any)?.grupo;
  const ejercicio = (params as any)?.ejercicio;

  if (!grupo || !ejercicio) {
    return <div className="container">Cargando vista del ejercicio...</div>;
  }

  const { data: session } = useSession();

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [fallo, setFallo] = useState(false);
  const [series, setSeries] = useState<Marca[]>([]);

  const getFechaLocal = () => {
    const hoyLocal = new Date();
    hoyLocal.setMinutes(hoyLocal.getMinutes() - hoyLocal.getTimezoneOffset());
    return hoyLocal.toISOString().split('T')[0];
  };

  const saveMark = async () => {
    const fechaLocal = getFechaLocal();

    const response = await fetch('/api/marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_email: session?.user?.email,
        date: fechaLocal,
        muscle_group: grupo,
        exercise: ejercicio,
        weight,
        reps,
        fallo,
      }),
    });
    if (response.ok) {
      alert('Serie añadida');
      setWeight('');
      setReps('');
      setFallo(false);
      fetchSeries();
    } else {
      alert('Error al guardar');
    }
  };

  const fetchSeries = async () => {
    const res = await fetch(`/api/marks?email=${session?.user?.email}`);
    const data = await res.json();
    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    const hoyStr = hoy.toLocaleDateString();

    const filtradas = data.filter((m: any) => {
      const fecha = new Date(m.date);
      fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
      const fechaStr = fecha.toLocaleDateString();

      return (
        m.muscle_group === grupo &&
        m.exercise === ejercicio &&
        fechaStr === hoyStr
      );
    });

    setSeries(filtradas);
  };

  useEffect(() => {
    if (session) fetchSeries();
  }, [session]);

  return (
    <div className="container">
      <HeaderA />
      <h1 className="title">{ejercicio.replace(/-/g, ' ')}</h1>
      <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Peso (kg)" /><br />
      <input type="number" value={reps} onChange={e => setReps(e.target.value)} placeholder="Repeticiones" /><br />
      <label>
        <input type="checkbox" checked={fallo} onChange={e => setFallo(e.target.checked)} />
        Fallo
      </label><br />
      <button onClick={saveMark} className="botones">Añadir Serie</button>
      <button className="boton-cancelar" onClick={() => router.back()}>Cancelar</button>


      {series.length > 0 && (
        <div className="series-list">
          <h2>Series añadidas hoy</h2>
          {series.map((s, index) => (
            <p key={index}>
              Peso: {s.weight} kg | Reps: {s.reps} {s.fallo ? 'Al Fallo !!!🔥' : ''}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
