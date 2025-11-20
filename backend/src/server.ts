import express from 'express';
import { Router } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import playlistRoutes from './routes/playlistRoutes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', playlistRoutes as express.Router);

mongoose.connect('mongodb://localhost:27017/musicdb')
  .then(() => {
    console.log('MongoDB conectado!');
    app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
  })
  .catch(err => console.error('Erro ao conectar no MongoDB:', err));
