import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/src/lib/db'; // ajusta esta ruta si tu archivo está en otro lugar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { email, date } = req.query;

  if (!email || !date || typeof email !== 'string' || typeof date !== 'string') {
    return res.status(400).json({ message: 'Parámetros inválidos' });
  }

  try {
    // Convertir de "29/5/2025" a "2025-05-29"
    const [dia, mes, año] = date.split('/');
    const fechaFormateada = `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

    const [result]: any = await db.query(
      'DELETE FROM marks WHERE user_email = ? AND DATE(date) = ?',
      [email, fechaFormateada]
    );

    res.status(200).json({ message: 'Entrenamientos eliminados correctamente' });
  } catch (error) {
    console.error('Error al eliminar entrenamientos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
