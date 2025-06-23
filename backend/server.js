// server.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

// Activar CORS para que el frontend pueda conectarse
app.use(cors());

// Para que el backend entienda JSON
app.use(express.json());

// Conectar o crear la base de datos SQLite
const db = new sqlite3.Database('notasapp.db');
db.run("PRAGMA foreign_keys = ON");
// Crear tabla si no existe
db.serialize(() => {
  // Crear tabla 'user'
  db.run(`
  CREATE TABLE IF NOT EXISTS "user" (
    "ID"	INTEGER NOT NULL,
    "username"	TEXT NOT NULL UNIQUE,
    "password"	TEXT NOT NULL,
    PRIMARY KEY("ID")
  );
  `);

  // Crear tabla 'notes'
  db.run(`
  CREATE TABLE IF NOT EXISTS "notes" (
    "ID"	INTEGER NOT NULL,
    "Title"	TEXT,
    "Body"	TEXT,
    "IDuser"	INTEGER,
    FOREIGN KEY("IDuser") REFERENCES "user"("ID"),
    PRIMARY KEY("ID" AUTOINCREMENT)
  );
  `);
});

// Ruta para obtener las notas de determinado usuario
app.get('/backend/user-notes/:IDuser', (req, res) => {
  const IDuser = req.params.IDuser;
  const sql = `SELECT * FROM notes WHERE IDuser = ?`;

  db.all(sql, [IDuser], (err, rows) => {
    if (err) {
      console.error("Error al obtener notas del usuario:", err.message);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    res.json(rows);
  });
});

// Guardar las notas de determinado usuario
app.post('/backend/user-notes/:IDuser', (req, res) => {
  const { title, body } = req.body;
  const IDuser = req.params.IDuser;


  if (!title || !body || ! IDuser) {
    return res.status(400).json({ error: "Faltan campos title, body o IDuser" });
  }

  console.log("Insertando nota:", { title, body, IDuser });
  const sql = `INSERT INTO notes (Title, Body, IDuser) VALUES (?, ?, ?)`; 
  db.run(sql, [title, body, IDuser], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Error al guardar la nota" });
    }
    res.json({ id: this.lastID });
  });
});


app.post('/backend/users', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Faltan campos username o password" });
  }

  const sql = `INSERT INTO user (username, password) VALUES (?, ?)`;
  db.run(sql, [username, password], function (err) {
    if (err) {
      console.error("Error al registrar usuario:", err.message);
      return res.status(500).json({ error: "Error al registrar usuario" });
    }
    res.status(201).json({ message: "Usuario registrado", id: this.lastID });
  });
});


app.post('/backend/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Verificar si el usuario ya existe
  const checkUser = 'SELECT * FROM user WHERE username = ?';
  db.get(checkUser, [username], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Error al verificar el usuario' });
    }

    if (row) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    // Insertar nuevo usuario
    const insertUser = 'INSERT INTO user (username, password) VALUES (?, ?)';
    db.run(insertUser, [username, password], function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Error al registrar usuario' });
      }

      res.status(201).json({ message: 'Usuario registrado', id: this.lastID });
    });
  });
});


//login user
app.post('/backend/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan username o password' });
  }

  const sql = `SELECT * FROM user WHERE username = ? AND password = ?`;
  db.get(sql, [username, password], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Error del servidor' });
    }

    if (!row) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    res.json({ message: 'Login exitoso', username: row.username, id: row.ID});
  });
});

//cuenta de notas: 
app.get('/backend/user-notes-count/:username', (req, res) => {
  const username = req.params.username;
  const sql = `
    SELECT COUNT(*) as count FROM notes
    JOIN user ON notes.IDuser = user.ID
    WHERE user.username = ?
  `;
  db.get(sql, [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Error en la consulta" });
    }
    res.json({ count: row.count });
  });
});



// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

