import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import { LastfmService, LastfmTrack } from '../lastfm.service';
import { PlaylistService, Playlist, Track } from '../playlist.service';

interface SearchTrack extends LastfmTrack {
  isSaving?: boolean;
  imageUrl?: string;
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

  public playlists: Playlist[] = [];

  public isAddModalOpen = false;
  public isConfirmDialogOpen = false;

  public selectedTrack: SearchTrack | null = null;
  public selectedPlaylistId: string | null = null;

  public alertButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
      handler: () => this.closeConfirmDialog(),
    },
    {
      text: 'Adicionar',
      role: 'confirm',
      handler: () => this.confirmAddTrack(),
    },
  ];

  async ngOnInit() {
    await this.loadPlaylists();
  }

  async loadPlaylists() {
    try {
      const playlistsData = await lastValueFrom(this.playlistService.getAll());
      this.playlists = playlistsData;
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

    await this.loadPlaylists();

    this.selectedPlaylistId =
      this.playlists.length > 0 ? this.playlists[0]._id ?? null : null;

    this.isAddModalOpen = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.selectedTrack = null;
    this.selectedPlaylistId = null;
  }

  openConfirmDialog() {
    this.isConfirmDialogOpen = true;
  }

  confirmAddTrack() {
    this.isConfirmDialogOpen = false;
    this.addTrackToPlaylist();
  }

  closeConfirmDialog() {
    this.isConfirmDialogOpen = false;
  }

  async addTrackToPlaylist() {
    if (!this.selectedTrack || !this.selectedPlaylistId) return;

    const trackToAdd: Track = {
      name: this.selectedTrack.name,
      artist:
        typeof this.selectedTrack.artist === 'string'
          ? this.selectedTrack.artist
          : (this.selectedTrack.artist as any)?.name || '',
      image:
        this.selectedTrack.image ||
        (this.selectedTrack?.imageUrl as string) ||
        '',
      addedAt: new Date().toISOString(),
    };

    console.log('Enviando track TAB2:', trackToAdd);

    try {
      await lastValueFrom(
        this.playlistService.addTrackToPlaylist(
          this.selectedPlaylistId,
          trackToAdd
        )
      );
      this.playlistService.playlistsUpdated.next();
      console.log('Música adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar música do TAB2:', error);
    } finally {
      this.closeAddModal();
    }
  }
}
