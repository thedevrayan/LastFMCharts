import { Injectable, inject } from '@angular/core';
import { Auth, getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, User } from '@angular/fire/auth';
import { 
  getFirestore, doc, onSnapshot, collection, query, orderBy, 
  addDoc, deleteDoc, updateDoc, Firestore, arrayUnion, arrayRemove
} from '@angular/fire/firestore';
import { initializeApp } from 'firebase/app';
import { signal } from '@angular/core';

// Interface para as músicas (Track)
export interface Track {
  name: string;
  artist: string;
  image: string;
  addedAt: any; 
  // Adicionamos 'id' para facilitar a remoção, mas pode ser opcional
  id?: string; 
}

// Interface principal da Playlist
export interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  createdAt: any; 
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  
  // Sinais para Gerenciamento de Estado
  public userId = signal<string | null>(null);
  public playlists = signal<Playlist[]>([]);
  public isLoading = signal<boolean>(true);
  
  private db!: Firestore;
  private auth!: Auth;
  private appId: string = 'default-app-id'; // Será substituído na inicialização
  
  constructor() {
    this.initializeFirebase();
  }

  /**
   * Inicializa o Firebase e a Autenticação.
   */
  private async initializeFirebase() {
    this.isLoading.set(true);

    const globalContext = window as any;
    const firebaseConfigString = globalContext.__firebase_config;
    const initialAuthToken = globalContext.__initial_auth_token;
    
    // Obter o appId global
    this.appId = globalContext.__app_id || 'default-app-id';

    try {
      if (!firebaseConfigString) {
        console.error("ERRO CRÍTICO: Configuração do Firebase não encontrada. Abortando inicialização.");
        this.isLoading.set(false);
        return;
      }
      
      // Inicializar Firebase
      const firebaseConfig = JSON.parse(firebaseConfigString);
      const app = initializeApp(firebaseConfig);
      this.db = getFirestore(app);
      this.auth = getAuth(app);
      
      // Tenta Autenticar
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(this.auth, initialAuthToken);
        } else {
          await signInAnonymously(this.auth);
        }
      } catch (authError) {
          console.warn("Falha na autenticação inicial. Continuando com onAuthStateChanged.", authError);
      }

      // Listener de Autenticação
      onAuthStateChanged(this.auth, (currentUser) => {
        if (currentUser) {
          this.userId.set(currentUser.uid);
          console.log("Serviço Firebase: SUCESSO. UID:", currentUser.uid);
          this.loadPlaylists(); 
        } else {
          this.userId.set(null);
          this.playlists.set([]);
          this.isLoading.set(false);
          console.log("Serviço Firebase: NENHUM usuário logado/anônimo.");
        }
      });

    } catch (error) {
      console.error("Erro FATAL na inicialização do Firebase:", error);
      this.isLoading.set(false);
    }
  }
  
  /**
   * Constrói o caminho da coleção privada do usuário.
   */
  private getPlaylistsCollectionPath(): string | null {
    const uid = this.userId();
    if (!uid) return null;
    return `artifacts/${this.appId}/users/${uid}/playlists`;
  }

  // --- CRUD: Read (Leitura em Tempo Real) ---
  
  /**
   * Carrega playlists em tempo real usando onSnapshot.
   */
  loadPlaylists() {
    const path = this.getPlaylistsCollectionPath();
    if (!path || !this.db) {
      this.isLoading.set(false);
      return; 
    }

    this.isLoading.set(true);
    
    const q = query(collection(this.db, path), orderBy('createdAt', 'desc'));

    // Inicia o listener em tempo real
    onSnapshot(q, (snapshot) => {
      const newPlaylists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Playlist[];
      this.playlists.set(newPlaylists);
      this.isLoading.set(false);
      console.log(`Serviço: Playlists carregadas: ${newPlaylists.length}`);
    }, (error) => {
      console.error("Serviço: Erro ao carregar playlists:", error);
      this.isLoading.set(false);
    });
  }

  // --- CRUD: Create (Criação de Playlist) ---

  /**
   * Cria uma nova playlist vazia.
   */
  async createPlaylist(name: string, description: string) {
    const path = this.getPlaylistsCollectionPath();
    if (!path || !name.trim()) {
      console.warn("Serviço: Caminho ou nome da playlist inválido.");
      return;
    }

    try {
      await addDoc(collection(this.db, path), {
        name: name.trim(),
        description: description.trim(),
        tracks: [],
        userId: this.userId(),
        createdAt: new Date(), 
      });
      console.log("Serviço: Playlist criada com sucesso.");
      return true;
    } catch (error) {
      console.error("Serviço: Erro ao criar playlist:", error);
      return false;
    }
  }

  // --- Update: Adicionar Música (NOVA FUNÇÃO CRUCIAL) ---

  /**
   * Adiciona uma música a uma playlist existente usando arrayUnion.
   */
  async addTrackToPlaylist(playlistId: string, track: Omit<Track, 'addedAt'>): Promise<boolean> {
    const path = this.getPlaylistsCollectionPath();
    if (!path || !playlistId) {
      console.warn("Serviço: Caminho ou ID da playlist inválido para adição de música.");
      return false;
    }
    
    // Constrói o objeto Track para o Firestore
    const trackToAdd: Track = {
      ...track,
      addedAt: new Date(),
    };

    try {
      const docRef = doc(this.db, path, playlistId);
      // Usamos arrayUnion para adicionar o objeto track ao array 'tracks'
      await updateDoc(docRef, { 
        tracks: arrayUnion(trackToAdd) 
      });
      console.log(`Serviço: Música ${track.name} adicionada à playlist ${playlistId}.`);
      return true;
    } catch (error) {
      console.error("Serviço: Erro ao adicionar música à playlist:", error);
      return false;
    }
  }

  // --- Outras Funções CRUD (Para tab3) ---
  
  /**
   * Atualiza nome e descrição da playlist.
   */
  async updatePlaylistDetails(playlistId: string, name: string, description: string) {
    const path = this.getPlaylistsCollectionPath();
    if (!path || !playlistId || !name.trim()) return false;

    try {
      const docRef = doc(this.db, path, playlistId);
      await updateDoc(docRef, {
        name: name.trim(),
        description: description.trim(),
      });
      console.log(`Serviço: Playlist ${playlistId} atualizada.`);
      return true;
    } catch (error) {
      console.error("Serviço: Erro ao atualizar playlist:", error);
      return false;
    }
  }

  /**
   * Remove uma música específica de uma playlist.
   */
  async removeTrackFromPlaylist(playlist: Playlist, trackIndex: number) {
    const path = this.getPlaylistsCollectionPath();
    if (!path) return false;
    
    const trackToRemove = playlist.tracks[trackIndex];
    if (!trackToRemove) return false;
    
    // O arrayRemove requer o objeto exato que foi salvo.
    // Para maior segurança, usamos o array temporário e o updateDoc, como antes.
    const updatedTracks = [...playlist.tracks];
    updatedTracks.splice(trackIndex, 1);

    try {
      const docRef = doc(this.db, path, playlist.id);
      await updateDoc(docRef, { tracks: updatedTracks });
      console.log(`Serviço: Música removida da playlist ${playlist.name}.`);
      return true;
    } catch (error) {
      console.error("Serviço: Erro ao remover música:", error);
      return false;
    }
  }
  
  /**
   * Deleta uma playlist.
   */
  async deletePlaylist(playlistId: string) {
    const path = this.getPlaylistsCollectionPath();
    if (!path || !playlistId) return false;

    try {
      const docRef = doc(this.db, path, playlistId);
      await deleteDoc(docRef);
      console.log(`Serviço: Playlist ${playlistId} deletada.`);
      return true;
    } catch (error) {
      console.error("Serviço: Erro ao deletar playlist:", error);
      return false;
    }
  }
}
