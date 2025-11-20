import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { LastfmService } from '../lastfm.service';
import { CommonModule } from '@angular/common'; 
import { HttpClientModule } from '@angular/common/http';
import { PlaylistService, Playlist, Track } from '../playlist.service';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule, FormsModule],
})
export class Tab1Page implements OnInit {
  
  public lastfmService = inject(LastfmService); 
  public playlistService = inject(PlaylistService);

  topTracks: any[] = [];
  loading = true;

  playlists: Playlist[] = [];         
  selectedPlaylistId: string | null = null;  

  constructor() {}

  async ngOnInit() {
    this.loadTopTracks();
    await this.loadPlaylists();
  }

 loadTopTracks() {
  this.lastfmService.getTopTracks().subscribe({
    next: (data) => {
      this.topTracks = data.tracks?.track.map((track: any) => {
        const imageObj = track.image.reverse().find((img: any) => img['#text']); 
        return {
          ...track,
          imageUrl: imageObj ? imageObj['#text'] : '', 
        };
      });
      this.loading = false;
    },
    error: (err) => {
      console.error('Erro ao buscar Top Tracks:', err);
      this.loading = false;
    }
  });
}


  async loadPlaylists() {
    try {
      const playlists = await lastValueFrom(this.playlistService.getAll());
      this.playlists = playlists;
    } catch (err) {
      console.error('Erro ao carregar playlists:', err);
    }
  }

  async addTrackToPlaylist(track: any) {
    if (!this.selectedPlaylistId) {
      alert('Selecione uma playlist primeiro!');
      return;
    }

    const imageObj = track.image?.reverse().find((img: any) => img['#text']);

    const trackData: Track = {
      name: track.name,
      artist: track.artist.name,
      image: imageObj ? imageObj['#text'] : '',
      addedAt: new Date().toISOString(),
    };

    try {
      await lastValueFrom(this.playlistService.addTrackToPlaylist(this.selectedPlaylistId, trackData));
      this.playlistService.playlistsUpdated.next();
      alert(`Música "${track.name}" adicionada à playlist!`);
    } catch (err) {
      console.error('Erro ao adicionar música à playlist:', err);
      alert('Erro ao adicionar música à playlist.');
    }
  }
}
