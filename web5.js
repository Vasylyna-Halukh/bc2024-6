const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();

// Парсер для JSON та форм
app.use(bodyParser.json());
const upload = multer();

// Шлях до директорії для зберігання нотаток
const cachePath = './cache';

// Перевірка існування директорії для кешу
if (!fs.existsSync(cachePath)) {
  fs.mkdirSync(cachePath);
}

// GET /notes/<ім’я нотатки> - Повертає текст нотатки або 404, якщо не знайдено
app.get('/notes/:name', (req, res) => {
  const notePath = path.join(cachePath, req.params.name);

  if (!fs.existsSync(notePath)) {
    return res.status(404).send('Нотатка не знайдена.');
  }

  const noteContent = fs.readFileSync(notePath, 'utf-8');
  res.send(noteContent);
});

// PUT /notes/<ім’я нотатки> - Оновлює нотатку
app.put('/notes/:name', (req, res) => {
  const notePath = path.join(cachePath, req.params.name);

  if (!fs.existsSync(notePath)) {
    return res.status(404).send('Нотатка не знайдена.');
  }

  fs.writeFileSync(notePath, req.body.text);
  res.send('Нотатка оновлена.');
});

// DELETE /notes/<ім’я нотатки> - Видаляє нотатку
app.delete('/notes/:name', (req, res) => {
  const notePath = path.join(cachePath, req.params.name);

  if (!fs.existsSync(notePath)) {
    return res.status(404).send('Нотатка не знайдена.');
  }

  fs.unlinkSync(notePath);
  res.send('Нотатка видалена.');
});

// GET /notes - Повертає список усіх нотаток
app.get('/notes', (req, res) => {
  const files = fs.readdirSync(cachePath);
  const notes = files.map(file => ({
    name: file,
    text: fs.readFileSync(path.join(cachePath, file), 'utf-8'),
  }));

  res.status(200).json(notes);
});

// POST /write - Створює нову нотатку
app.post('/write', upload.none(), (req, res) => {
  const noteName = req.body.note_name;
  const noteContent = req.body.note;

  if (!noteName || !noteContent) {
    return res.status(400).send('Неправильний формат запиту.');
  }

  const notePath = path.join(cachePath, noteName);

  if (fs.existsSync(notePath)) {
    return res.status(400).send('Нотатка з таким ім’ям вже існує.');
  }

  fs.writeFileSync(notePath, noteContent);
  res.status(201).send('Нотатка створена.');
});

// GET /UploadForm.html - Повертає HTML форму для завантаження нотатки
app.get('/UploadForm.html', (req, res) => {
  const formHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Завантаження нотатки</title>
    </head>
    <body>
      <form action="/write" method="POST" enctype="multipart/form-data">
        <label for="note_name">Ім'я нотатки:</label>
        <input type="text" id="note_name" name="note_name" required><br><br>
        <label for="note">Текст нотатки:</label><br>
        <textarea id="note" name="note" rows="10" cols="30" required></textarea><br><br>
        <button type="submit">Зберегти</button>
      </form>
    </body>
    </html>
  `;

  res.send(formHTML);
});

// Запуск сервера
const port = 3000;
const host = '127.0.0.1';
app.listen(port, host, () => {
  console.log(`Сервер запущено на http://${host}:${port}`);
});
