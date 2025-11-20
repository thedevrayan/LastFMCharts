import { Component, OnInit, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { PlaylistService, Playlist, Track } from '../playlist.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
})
export class Tab3Page implements OnInit {
  public playlistService = inject(PlaylistService);

  public playlists: Playlist[] = [];
  public loading = false;
  public isCreationModalOpen = false;
  public newPlaylistName = '';
  public newPlaylistDescription = '';
  public selectedPlaylist: Playlist | null = null;
  public editingPlaylistName = '';
  public editingPlaylistDescription = '';
  newTrackArtist: any;
  newTrackName: any;
  newTrack: string = '';
  expandedPlaylistId: string = '';

  async ngOnInit() {
    await this.loadPlaylists();
  }

  togglePlaylist(playlist: Playlist) {
 
  if (this.expandedPlaylistId === playlist._id) {
    this.expandedPlaylistId = '';
  } else {
   
    this.expandedPlaylistId = playlist._id!;
  }
}

  async loadPlaylists() {
    this.loading = true;
    try {
      const playlists = await lastValueFrom(this.playlistService.getAll());
      this.playlists = playlists;
    } catch (err) {
      console.error('Erro ao carregar playlists:', err);
    } finally {
      this.loading = false;
    }
  }

async createPlaylist() {
  const payload = {
    name: (this.newPlaylistName ?? '').trim(),
    description: (this.newPlaylistDescription ?? '').trim(),
    tracks: []
  };

  if (!payload.name) {
    console.warn('⚠️ Nome da playlist é obrigatório');
    return;
  }

  console.log('🎶 Criando playlist:', payload);

  try {
    const created = await lastValueFrom(this.playlistService.create(payload));
    console.log('✅ Playlist criada:', created);


    this.playlists.push(created);

    this.newPlaylistName = '';
    this.newPlaylistDescription = '';
    this.isCreationModalOpen = false;
  } catch (err) {
    console.error('❌ Erro ao criar playlist:', err);
  }
}

closeCreationModal() {
  this.isCreationModalOpen = false;
  this.newPlaylistName = '';
  this.newPlaylistDescription = '';
}

  openEditModal(playlist: Playlist) {
    this.selectedPlaylist = playlist;
    this.editingPlaylistName = playlist.name;
    this.editingPlaylistDescription = playlist.description || '';

  } closeEditModal() {
  this.selectedPlaylist = null;
}

  async editPlaylist(playlist: Playlist) {
  this.selectedPlaylist = playlist;
  this.editingPlaylistName = playlist.name;
  this.editingPlaylistDescription = playlist.description || '';
}


async savePlaylistEdits() {
  
  if (!this.selectedPlaylist?._id) {
    console.warn('savePlaylistEdits: selectedPlaylist ou _id ausente');
    return;
  }

  const id = this.selectedPlaylist._id;
  const payload = {
    name: (this.editingPlaylistName ?? '').trim(),
    description: (this.editingPlaylistDescription ?? '').trim()
  };

  if (!payload.name) {
    console.warn('savePlaylistEdits: nome inválido');
    return;
  }

  console.log('🛠️ Salvando playlist', id, payload);

  try {
    const updated = await lastValueFrom(this.playlistService.update(id, payload));
    console.log('✅ Resposta do update:', updated);

    this.playlists = this.playlists.map(p => p._id === id ? updated : p);

    this.selectedPlaylist = null;
    this.editingPlaylistName = '';
    this.editingPlaylistDescription = '';

  } catch (err) {
    console.error('❌ Erro ao salvar playlist:', err);
  }
}


async deletePlaylist(id?: string) {
  if (!id) return;

  console.log("🗑️ Iniciando exclusão da playlist...");
  console.log("➡️ ID recebido:", id);

  try {
    await lastValueFrom(this.playlistService.delete(id));
    console.log("✅ Playlist excluída com sucesso!");
    await this.loadPlaylists();
  } catch (err) {
    console.error("❌ Erro ao excluir playlist:", err);
  }
}

async addTrackToPlaylist(playlistId: string, trackName: string) {
  const track = trackName?.trim();
  if (!track) return;
  await lastValueFrom(this.playlistService.addTrack(playlistId, track));
  this.newTrack = ''; 
  await this.loadPlaylists();
}

async addTrack() {
  if (!this.selectedPlaylist?._id) return;

  const name = (this.newTrackName ?? '').trim();
  const artist = (this.newTrackArtist ?? '').trim();
  if (!name || !artist) return;

  const newTrack: Track = {
    name,
    artist,
    image: '',
    addedAt: new Date().toISOString(),
  };

  const playlistId = this.selectedPlaylist._id;

  try {
    const updated = await lastValueFrom(
      this.playlistService.addTrackToPlaylist(playlistId, newTrack)
    );

    this.selectedPlaylist = updated;

    const index = this.playlists.findIndex(p => p._id === playlistId);
    if (index !== -1) {
      this.playlists[index] = updated;
    }

    this.newTrackName = '';
    this.newTrackArtist = '';

    console.log('Música adicionada com sucesso!');
  } catch (err) {
    console.error('Erro ao adicionar música:', err);
  }
}

  async removeTrackFromPlaylist(playlistId: string, trackName: string) {
    try {
      await lastValueFrom(this.playlistService.removeTrackFromPlaylist(playlistId, trackName));
      await this.loadPlaylists();
    } catch (err) {
      console.error('Erro ao remover música:', err);
    }
  }
  
}


