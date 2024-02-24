const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Client } = require('pg');
const morgan = require('morgan');

const app = express();
const PORT = 3000;

// Middleware para registrar las solicitudes HTTP
app.use(morgan('combined'));
console.log('Este es un mensaje de prueba de error')
app.use(bodyParser.json());

// Directorio donde se encuentran los archivos estáticos
const publicDirectoryPath = path.join(__dirname, '');

// Middleware para servir archivos estáticos
app.use(express.static(publicDirectoryPath));
app.use(express.static(path.join(__dirname, 'img')));
app.use(express.static(path.join(__dirname, 'lib')));
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'js')));
app.use(express.static(path.join(__dirname, 'scss')));

// Configuración de la conexión a la base de datos PostgreSQL
const client = new Client({
    user: 'ucnqjwxm',
    host: 'motty.db.elephantsql.com',
    database: 'ucnqjwxm',
    password: 'JtEK1E3bzyFqIe8UUpfLGoizBgeq7zVz',
    port: 5432,
});
// Conectar a la base de datos
client.connect()
    .then(() => console.log('Conexión exitosa a PostgreSQL'))
    .catch(error => console.error('Error al conectar a PostgreSQL', error));

    async function cargarMarcadores() {
        try {
            const queryText = 'SELECT * FROM marcadores';
            const result = await client.query(queryText);
            const marcadores = result.rows;
    
            console.log('Marcadores cargados con éxito.');
            return marcadores; // Devolver los marcadores recuperados
        } catch (error) {
            console.error('Error al cargar los marcadores:', error);
            throw error; // Relanzar el error para que se maneje en el punto de llamada
        }
    } 
    
 // Ruta para cargar la página y los marcadores
app.get('/Mapa.html', async (req, res) => {
    try {
        const marcadores = await cargarMarcadores();
        res.sendFile(path.join(__dirname + "/Mapa.html")); // Enviar Mapa.html al frontend
    } catch (error) {
        res.status(500).send('Error al cargar los marcadores.');
    }
});

// Ruta para guardar un nuevo marcador
app.post('/markers', async (req, res) => {
    try {
        const { latitud, longitud, texto, imagen } = req.body;
        const queryText = 'INSERT INTO marcadores (latitud, longitud, texto, imagen) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [latitud, longitud, texto, imagen];
        const result = await client.query(queryText, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al guardar el marcador:', error);
        res.status(500).json({ error: 'Error al guardar el marcador.' });
    }
});

// Ruta para obtener todos los marcadores desde la base de datos
app.get('/markers', async (req, res) => {
    try {
        const marcadores = await cargarMarcadores();
        res.json(marcadores); // Enviar los marcadores como respuesta
    } catch (error) {
        console.error('Error al obtener los marcadores:', error);
        res.status(500).json({ error: 'Error al obtener los marcadores.' });
    }
});

// Ruta para eliminar un marcador
app.delete('/markers', async (req, res) => {
    try {
        const { latitud, longitud } = req.body;
        const queryText = 'DELETE FROM marcadores WHERE latitud = $1 AND longitud = $2';
        const values = [latitud, longitud];
        await client.query(queryText, values);
        res.status(200).json({ message: 'Marcador eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar el marcador:', error);
        res.status(500).json({ error: 'Error al eliminar el marcador.' });
    }
});

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
});

app.listen(PORT, () => {
    console.log("Servidor escuchando en el puerto", PORT);
});
