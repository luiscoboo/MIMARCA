// src/pages/api/marks.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_email, muscle_group, exercise, weight, reps, fallo } = req.body;
    const date = new Date().toISOString().split('T')[0];

    try {
      await db.query(
        'INSERT INTO marks (user_email, date, muscle_group, exercise, weight, reps, fallo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user_email, date, muscle_group, exercise, weight, reps, fallo ? 1 : 0] // Convertimos fallo a 1 o 0
      );
      res.status(200).json({ message: 'Marca guardada correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al guardar la marca' });
    }

  } else if (req.method === 'GET') {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Se requiere el parámetro email' });
    }

    try {
      const [rows] = await db.query(
        'SELECT id, date, muscle_group, exercise, weight, reps, fallo FROM marks WHERE user_email = ? ORDER BY date DESC',
        [email]
      );

      
      const marcas = (rows as any[]).map(m => ({
        ...m,
        fallo: !!m.fallo
      }));

      res.status(200).json(marcas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener marcas' });
    }

  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
