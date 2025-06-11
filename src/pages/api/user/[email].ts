import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/src/lib/db';
import formidable from 'formidable';
import fs from 'fs';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query;

  if (req.method === 'GET') {
    let [rows]: [any[], any] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      // Crear nuevo usuario con id_publico aleatorio
      const id_publico = crypto.randomBytes(4).toString('hex');
      await db.query(
        'INSERT INTO users (email, name, weight, fat_percentage, image, id_publico) VALUES (?, ?, ?, ?, ?, ?)',
        [email, '', '', '', '', id_publico]
      );
      const [rows]: [any[], any] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    } else if (!rows[0].id_publico) {
      // Si existe pero no tiene id_publico, se genera y se guarda
      const id_publico = crypto.randomBytes(4).toString('hex');
      await db.query('UPDATE users SET id_publico = ? WHERE email = ?', [id_publico, email]);
      const [rows]: [any[], any] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    }

    res.status(200).json(rows[0]);

  } else if (req.method === 'PUT') {
    const form = formidable();
    form.parse(req, async (err: any, fields: formidable.Fields, files: formidable.Files) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al procesar el formulario' });
        return;
      }

      let image = '';
      if (files.file) {
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        const data = fs.readFileSync(file.filepath);
        const path = `./public/uploads/${file.originalFilename}`;
        fs.writeFileSync(path, data);
        image = path.replace('./public', '');
      }

      await db.query(
        `UPDATE users 
         SET name = ?, weight = ?, fat_percentage = ?, image = IFNULL(?, image) 
         WHERE email = ?`,
        [
          fields.name || null,
          fields.weight || null,
          fields.fat_percentage || null,
          image || null,
          email,
        ]
      );

      res.status(200).json({ message: 'Datos actualizados' });
    });
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
