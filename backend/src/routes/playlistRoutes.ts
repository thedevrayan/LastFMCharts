import { Router } from 'express';
import { PlaylistModel } from '../models/Playlist';

const router = Router();

router.get('/playlists', async (req, res) => {
  const playlists = await PlaylistModel.find();
  res.json(playlists);
});

router.post('/playlists', async (req, res) => {
  const { name, description, createdAt, tracks } = req.body;
  if (!name) return res.status(400).json({ message: 'Nome da playlist é obrigatório' });

  const playlist = new PlaylistModel({
    name,
    description,
    createdAt: createdAt || new Date(),
    tracks: tracks || []
  });

  await playlist.save();
  res.status(201).json(playlist);
});

router.get('/playlists/:id/tracks', async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await PlaylistModel.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist não encontrada.' });
    }

    res.json(playlist.tracks || []);
  } catch (error) {
    console.error('Erro ao buscar músicas da playlist:', error);
    res.status(500).json({ message: 'Erro ao buscar músicas da playlist.', error });
  }
});

router.post('/playlists/:id/tracks', async (req, res) => {
  try {
    const { id } = req.params;
    const track = req.body; 

    if (!track?.name || !track?.artist) {
      return res.status(400).json({ message: 'Dados da música inválidos.' });
    }

    const playlist = await PlaylistModel.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist não encontrada.' });
    }

    playlist.tracks.push(track);
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    console.error('Erro ao adicionar música à playlist:', error);
    res.status(500).json({ message: 'Erro ao adicionar música à playlist.', error });
  }
});

router.put('/playlists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updated = await PlaylistModel.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Playlist não encontrada.' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar playlist.', error });
  }
});

router.delete('/playlists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PlaylistModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Playlist não encontrada' });
    }

    res.status(200).json({ message: 'Playlist deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar playlist', error });
  }
});

router.delete('/playlists/:id/tracks/:trackName', async (req, res) => {
  try {
    const { id, trackName } = req.params;

    const playlist = await PlaylistModel.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist não encontrada' });
    }

    const before = playlist.tracks.length;

    playlist.tracks = playlist.tracks.filter(t => t.name !== trackName);

    if (playlist.tracks.length === before) {
      return res.status(404).json({ message: 'Música não encontrada na playlist' });
    }

    await playlist.save();

    res.json({ message: 'Música removida com sucesso', playlist });
  } catch (error) {
    console.error('Erro ao remover música:', error);
    res.status(500).json({ message: 'Erro ao remover música', error });
  }
});



export default router;
