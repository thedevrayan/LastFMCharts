import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import playlistRoutes from './routes/playlistRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', playlistRoutes);

const PORT = process.env.PORT || 3000;

mongoose.connect("mongodb+srv://lastfmUser:Lastfm123!@cluster0.oeizf0j.mongodb.net/lastfmDB?retryWrites=true&w=majority")
  .then(() => {
    console.log('✅ MongoDB Atlas conectado!');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => console.error('❌ Erro ao conectar no MongoDB Atlas:', err));
