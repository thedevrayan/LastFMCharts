import express from 'express';
import { Router } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import playlistRoutes from './routes/playlistRoutes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', playlistRoutes);

mongoose.connect("mongodb+srv://lastfmUser:Lastfm123!@cluster0.oeizf0j.mongodb.net/lastfmDB?retryWrites=true&w=majority")
  .then(() => {
    console.log('✅ MongoDB Atlas conectado!');
    app.listen(3000, '0.0.0.0', () => console.log('Servidor rodando em http://0.0.0.0:3000'));
  })
  .catch(err => console.error('❌ Erro ao conectar no MongoDB Atlas:', err));

