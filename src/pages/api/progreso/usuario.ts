// src/pages/api/progreso/usuario.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id_publico } = req.query;

  if (!id_publico || typeof id_publico !== 'string') {
    return res.status(400).json({ error: 'id_publico es requerido' });
  }

  try {
    // 1. Obtener el email a partir del id_publico
    const [users]: any = await db.query('SELECT email, name FROM users WHERE id_publico = ?', [id_publico]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { email, name } = users[0];

    // 2. Obtener las marcas del usuario
    const [rows]: any = await db.query(
      'SELECT muscle_group, weight, reps FROM marks WHERE user_email = ?',
      [email]
    );

    const maxPorGrupo: Record<string, number> = {
      pecho: 1500,
      piernas: 2200,
      espalda: 1000,
      hombros: 1000,
      brazos: 1000,
      abdomen: 1000,
    };

    const nombreBonito = (grupo: string) => {
      const mapa: Record<string, string> = {
        pecho: 'Pecho',
        pierna: 'Pierna',
        espalda: 'Espalda',
        hombros: 'Hombros',
        brazo: 'Brazos',
        abdomen: 'Abdomen',
      };
      return mapa[grupo] || grupo.charAt(0).toUpperCase() + grupo.slice(1);
    };

    const sumatorios: Record<string, number[]> = {};

    for (const row of rows) {
      const { muscle_group, weight, reps } = row;
      if (!sumatorios[muscle_group]) sumatorios[muscle_group] = [];
      sumatorios[muscle_group].push(weight * reps);
    }

    const resultado: Record<string, number> = {};

    for (const grupo in sumatorios) {
      const valores = sumatorios[grupo];
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;
      const maximo = maxPorGrupo[grupo] || 1000;
      const normalizado = Math.min((media / maximo) * 10, 10);
      resultado[nombreBonito(grupo)] = parseFloat(normalizado.toFixed(2));
    }

    res.status(200).json({ nombre: name || 'Sin nombre', grafica: resultado });
  } catch (err) {
    console.error('Error al obtener el progreso de otro usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
