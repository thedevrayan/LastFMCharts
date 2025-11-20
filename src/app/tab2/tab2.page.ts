import { Component, OnInit, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import { LastfmService, LastfmTrack } from '../lastfm.service';
import { PlaylistService, Playlist, Track } from '../playlist.service';

interface SearchTrack extends LastfmTrack {
  isSaving?: boolean;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
})
export class Tab2Page implements OnInit {
  private lastfmService = inject(LastfmService);
  private playlistService = inject(PlaylistService);

  public searchTerm = '';
  public searchResults: SearchTrack[] = [];
  public isSearching = false;

  public playlists = signal<Playlist[]>([]);

  public isAddModalOpen = false;
  public selectedTrack: SearchTrack | null = null;
  public selectedPlaylistId: string | null = null;

  async ngOnInit() {
    try {
      const playlistsData = await lastValueFrom(this.playlistService.getAll());
      this.playlists.set(playlistsData);
    } catch (err) {
      console.error('Erro ao carregar playlists:', err);
    }
  }

  async searchMusic() {
    const term = this.searchTerm.trim();
    if (!term) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    try {
      const results = await lastValueFrom(this.lastfmService.searchTracks(term));
      this.searchResults = results.map((r) => ({ ...r, isSaving: false }));
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      this.isSearching = false;
    }
  }

async openAddModal(track: SearchTrack) {
  this.selectedTrack = track;

  try {
    const playlistsData = await lastValueFrom(this.playlistService.getAll());
    this.playlists.set(playlistsData);
  } catch (err) {
    console.error('Erro ao carregar playlists:', err);
    this.playlists.set([]); 
  }

  const allPlaylists = this.playlists();
  this.selectedPlaylistId = allPlaylists.length > 0 ? allPlaylists[0]._id ?? null : null;

  this.isAddModalOpen = true;
}

  closeAddModal() {
    this.isAddModalOpen = false;
    this.selectedTrack = null;
    this.selectedPlaylistId = null;
  }

  async addTrackToPlaylist() {
    if (!this.selectedTrack || !this.selectedPlaylistId) return;

    const trackToAdd: Track = {
      name: this.selectedTrack.name,
      artist: this.selectedTrack.artist,
      image: this.selectedTrack.image, 
      addedAt: new Date().toISOString(),
    };

    const index = this.searchResults.findIndex(
      (t) => t.name === this.selectedTrack?.name && t.artist === this.selectedTrack?.artist
    );
    if (index !== -1) this.searchResults[index].isSaving = true;

    try {
      await this.playlistService.addTrackToPlaylist(this.selectedPlaylistId, trackToAdd);
    } catch (error) {
      console.error('Erro ao adicionar música:', error);
    } finally {
      if (index !== -1) this.searchResults[index].isSaving = false;
      this.closeAddModal();
    }
  }
}
