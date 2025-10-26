import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // IMPORTADO: Necessário para componentes standalone
import { lastValueFrom } from 'rxjs'; // IMPORTADO: Converte Observable em Promise para usar com await

import { LastfmService, LastfmTrack } from '../lastfm.service'; 
import { PlaylistService, Track } from '../playlist.service';
import { signal } from '@angular/core';

interface SearchTrack extends LastfmTrack {
  isSaving?: boolean;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  // Adiciona o HttpClientModule para que o serviço funcione
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule] 
})
export class Tab2Page implements OnInit {
  
  // Serviços Injetados
  private lastfmService = inject(LastfmService);
  private playlistService = inject(PlaylistService); 

  // Estado Local de Busca
  public searchTerm = signal('');
  public searchResults = signal<SearchTrack[]>([]);
  public isSearching = signal(false);
  
  // Estado de Playlists para Adição
  public playlists = this.playlistService.playlists; 
  public isAddModalOpen = false;
  public selectedTrack: SearchTrack | null = null;
  public selectedPlaylistId: string | null = null;

  constructor() {}

  ngOnInit(): void {
    // Inicialização, se necessário
  }

  // --- Funções de Busca ---

  async searchMusic() {
    const term = this.searchTerm().trim();
    if (!term) {
      this.searchResults.set([]);
      return;
    }
    
    this.isSearching.set(true);
    this.searchResults.set([]);

    try {
      // CORREÇÃO: Usamos lastValueFrom para converter o Observable<LastfmTrack[]> 
      // em uma Promise<LastfmTrack[]>, que pode ser aguardada pelo 'await'.
      const results: LastfmTrack[] = await lastValueFrom(this.lastfmService.searchTracks(term)); 
      
      this.searchResults.set(results.map(r => ({
          ...r, 
          isSaving: false
      }) as SearchTrack));

    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      this.isSearching.set(false);
    }
  }

  // --- Funções de Adição à Playlist ---

  /**
   * Abre o modal de seleção de playlist para uma música específica.
   */
  openAddModal(track: SearchTrack) {
    this.selectedTrack = track;
    // Seleciona a primeira playlist por padrão, se houver
    this.selectedPlaylistId = this.playlists().length > 0 ? this.playlists()[0].id : null;
    this.isAddModalOpen = true;
  }
  
  closeAddModal() {
    this.isAddModalOpen = false;
    this.selectedTrack = null;
    this.selectedPlaylistId = null;
  }

  /**
   * Adiciona a música selecionada à playlist escolhida usando o PlaylistService.
   */
  async addTrackToSelectedPlaylist() {
    if (!this.selectedTrack || !this.selectedPlaylistId) {
      console.warn("Música ou Playlist não selecionada.");
      return;
    }

    const track = this.selectedTrack;
    const playlistId = this.selectedPlaylistId;
    
    // Constrói o objeto Track básico para ser salvo.
    const trackToAdd: Omit<Track, 'addedAt'> = {
        name: track.name,
        artist: track.artist,
        image: track.image, 
    };

    // Atualiza o estado visualmente para indicar salvamento
    const currentResults = this.searchResults();
    const resultIndex = currentResults.findIndex(t => t.name === track.name && t.artist === track.artist);
    if (resultIndex !== -1) {
        currentResults[resultIndex].isSaving = true;
        this.searchResults.set([...currentResults]);
    }
    
    try {
        await this.playlistService.addTrackToPlaylist(playlistId, trackToAdd);
    } catch (error) {
        console.error("Falha ao adicionar música:", error);
    } finally {
        // Limpa o estado de salvamento
        if (resultIndex !== -1) {
            currentResults[resultIndex].isSaving = false;
            this.searchResults.set([...currentResults]);
        }
        this.closeAddModal();
    }
  }
}
