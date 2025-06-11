'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import HeaderA from '../components/HeaderA';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../styles/VerMarcas.css';
import { useRouter } from 'next/navigation';


type Marca = {
  id: number;
  date: string;
  muscle_group: string;
  exercise: string;
  weight: number;
  reps: number;
  fallo: boolean;
};

export default function VerMarcas() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [diasAbiertos, setDiasAbiertos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (session) {
      fetch(`/api/marks?email=${session.user?.email}`)
        .then(res => res.json())
        .then(data => setMarcas(data))
        .catch(err => console.error(err));
    }
  }, [session]);

  const handleDeleteDia = async (dia: string) => {
    if (!session?.user?.email) return;

    const confirmacion = confirm(`¿Seguro que quieres eliminar todos los entrenamientos del ${dia}? Esta acción no se puede deshacer.`);
    if (!confirmacion) return;

    const response = await fetch(`/api/marks/delete?email=${session.user.email}&date=${encodeURIComponent(dia)}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setMarcas(prev =>
        prev.filter(m => {
          const fecha = new Date(m.date);
          fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
          return fecha.toISOString().split('T')[0] !== dia;
        })
      );
      setDiasAbiertos(prev => ({ ...prev, [dia]: false }));
      alert(`Entrenamientos del ${dia} eliminados.`);
    } else {
      alert('Error al eliminar entrenamientos.');
    }
  };

  const descargarPDF = (dia: string, ejercicios: Record<string, Marca[]>) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Entrenamiento del ${new Date(dia).toLocaleDateString()}`, 14, 20);

    Object.keys(ejercicios).forEach((ejercicio, index) => {
      const rows = ejercicios[ejercicio].map(m => [
        `${m.weight} kg`,
        `${m.reps}`,
        m.fallo ? '🔥 Sí' : 'No',
      ]);

      autoTable(doc, {
        startY: 30 + index * 60,
        head: [[`Ejercicio: ${ejercicio}`, 'Reps', 'Fallo']],
        body: rows,
        theme: 'striped',
        margin: { top: 10 },
      });
    });

    doc.save(`Entrenamiento-${dia}.pdf`);
  };

  if (status === 'loading') return <p>Cargando...</p>;
  if (!session) return <p>Inicia sesión para ver tus marcas.</p>;

  const marcasPorDia = marcas.reduce((acc, marca) => {
    const fecha = new Date(marca.date);
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
    const diaLocal = fecha.toISOString().split('T')[0];

    if (!acc[diaLocal]) acc[diaLocal] = {};
    if (!acc[diaLocal][marca.exercise]) acc[diaLocal][marca.exercise] = [];
    acc[diaLocal][marca.exercise].push(marca);
    return acc;
  }, {} as Record<string, Record<string, Marca[]>>);

  const toggleDia = (dia: string) =>
    setDiasAbiertos(prev => ({ ...prev, [dia]: !prev[dia] }));

  return (
    <div className="container">
      <HeaderA />
      <h1>Historial de Marcas</h1>

      <input
        type="text"
        placeholder="Buscar por fecha (ej. 12/6/2024)"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="buscador-fecha"
      />

      <div className="calendario-btn-wrapper">
        <button
          onClick={() => router.push('/calendario')}
          className="btn-ir-calendario"
        >
          VER CALENDARIO DE ENTRENAMIENTOS
        </button>
      </div>



      {Object.keys(marcasPorDia)
        .filter(dia => {
          if (!busqueda) return true;
          const fechaFormateada = new Date(dia).toLocaleDateString();
          return fechaFormateada.includes(busqueda);
        })
        .map(dia => (

          <div key={dia} className="dia-section">
            <button onClick={() => toggleDia(dia)} className="dia-btn">
              {new Date(dia).toLocaleDateString()}
            </button>

            {diasAbiertos[dia] && (
              <div className="ejercicios-container">
                {Object.keys(marcasPorDia[dia]).map(ejercicio => (
                  <div key={ejercicio} className="ejercicio-section">
                    <h3>{ejercicio}</h3>
                    <table className="ejercicio-table">
                      <thead>
                        <tr>
                          <th>Peso (kg)</th>
                          <th>Reps</th>
                          <th>Fallo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marcasPorDia[dia][ejercicio].map(m => (
                          <tr key={m.id}>
                            <td>{m.weight}</td>
                            <td>{m.reps}</td>
                            <td>{m.fallo ? <span className="fallo-icon">🔥</span> : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}

                <div className="botones-dia">
                  <button
                    onClick={() => handleDeleteDia(dia)}
                    className="btn-eliminar-dia"
                  >
                    Eliminar entreno
                  </button>

                  <button
                    onClick={() => descargarPDF(dia, marcasPorDia[dia])}
                    className="btn-pdf-dia"
                  >
                    Descargar PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
