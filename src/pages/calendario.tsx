'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import HeaderA from '../components/HeaderA';
import '../styles/CalendarioPage.css';

type Marca = {
  id: number;
  date: string;
  muscle_group: string;
  exercise: string;
  weight: number;
  reps: number;
  fallo: boolean;
};

export default function CalendarioPage() {
  const { data: session } = useSession();
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/marks?email=${session.user.email}`)
        .then(res => res.json())
        .then(setMarcas);
    }
  }, [session]);

  const diasConEntreno = useMemo(() => {
    return new Set(
      marcas.map(m => {
        const fecha = new Date(m.date);
        fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
        return fecha.toISOString().split('T')[0];
      })
    );
  }, [marcas]);

  const marcasDelDia = useMemo(() => {
    if (!fechaSeleccionada) return [];
    return marcas.filter(m => {
      const fecha = new Date(m.date);
      fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
      return fecha.toISOString().split('T')[0] === fechaSeleccionada;
    });
  }, [fechaSeleccionada, marcas]);

  return (
    <div className="container">
      <HeaderA />
      <h1 className="titulo">Calendario de Entrenamientos</h1>

      <Calendar
        onClickDay={(date) => {
          const dia = new Date(date);
          dia.setMinutes(dia.getMinutes() - dia.getTimezoneOffset());
          setFechaSeleccionada(dia.toISOString().split('T')[0]);
        }}
        tileClassName={({ date }) => {
          const dia = new Date(date);
          dia.setMinutes(dia.getMinutes() - dia.getTimezoneOffset());
          return diasConEntreno.has(dia.toISOString().split('T')[0]) ? 'dia-con-entreno' : '';
        }}
      />

      {fechaSeleccionada && (
        <div className="preview">
          <h2>Entrenamiento del {new Date(fechaSeleccionada).toLocaleDateString()}</h2>
          {marcasDelDia.length === 0 ? (
            <p>No se registraron marcas este día.</p>
          ) : (
            marcasDelDia.map((m, i) => (
              <div key={i} className="preview-marca">
                <strong>{m.exercise}</strong>: {m.weight} kg x {m.reps} reps {m.fallo ? '🔥' : ''}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
