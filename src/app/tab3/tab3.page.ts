import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
// REMOVIDO: import { IonDivider } from '@ionic/angular/standalone'; 
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, Auth, User } from 'firebase/auth';
import { 
  getFirestore, doc, onSnapshot, collection, query, orderBy, 
  addDoc, deleteDoc, updateDoc, Firestore
} from 'firebase/firestore';
import { Subscription } from 'rxjs';

// Interface para as músicas (Track)
interface Track {
  name: string;
  artist: string;
  image: string;
  addedAt: any; 
}

// Interface principal da Playlist
interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  createdAt: any; 
  userId: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  // CORREÇÃO FINAL: Removido IonDivider daqui. IonicModule já é suficiente.
  imports: [IonicModule, CommonModule, FormsModule, DatePipe], 
  providers: [DatePipe]
})
export class Tab3Page implements OnInit, OnDestroy {
  
  // Variáveis Firebase
  private db!: Firestore;
  private auth!: Auth;
  
  // Estado de Autenticação e Carregamento
  public userId: string | null = null;
  public isAuthReady: boolean = false;
  public playlists: Playlist[] = [];
  public isLoading: boolean = true;
  private playlistSubscription: Subscription | null = null;

  // Estado do Modal de Criação (C)
  public newPlaylistName: string = '';
  public newPlaylistDescription: string = '';
  public isCreationModalOpen: boolean = false;

  // Estado do Modal de Detalhes (R) e Edição (U)
  public isDetailsModalOpen: boolean = false;
  public selectedPlaylist: Playlist | null = null;
  public isEditModalOpen: boolean = false;
  public editingPlaylistName: string = '';
  public editingPlaylistDescription: string = '';

  constructor() {}

  ngOnInit() {
    this.initializeFirebase();
  }
  
  ngOnDestroy() {
    if (this.playlistSubscription) {
      this.playlistSubscription.unsubscribe();
    }
  }

  /**
   * Inicializa o Firebase, Autentica o usuário e inicia a carga de dados.
   * Usa acesso seguro às variáveis globais para evitar ReferenceError.
   */
  private async initializeFirebase() {
    this.isLoading = true;

    // Acessa as variáveis globais de forma segura, tratando 'window' como 'any'
    const globalContext = window as any;
    
    // Configurações fornecidas pelo ambiente (Canvas)
    const firebaseConfigString = globalContext.__firebase_config;
    const initialAuthToken = globalContext.__initial_auth_token;
    const appId = globalContext.__app_id || 'default-app-id';

    try {
      if (!firebaseConfigString) {
        console.error("ERRO CRÍTICO: Configuração do Firebase não encontrada. Abortando inicialização.");
        this.isLoading = false;
        this.isAuthReady = true;
        return;
      }
      
      const firebaseConfig = JSON.parse(firebaseConfigString);
      
      const app = initializeApp(firebaseConfig);
      this.db = getFirestore(app);
      this.auth = getAuth(app);
      
      // --- 1. Tenta Autenticar Imediatamente ---
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(this.auth, initialAuthToken);
        } else {
          await signInAnonymously(this.auth);
        }
      } catch (authError) {
          console.warn("Falha na autenticação inicial. Continuando com onAuthStateChanged.", authError);
      }

      // --- 2. Usa o Listener para Confirmar o Estado e Carregar Dados ---
      onAuthStateChanged(this.auth, (currentUser) => {
        
        if (this.isAuthReady && this.userId === currentUser?.uid) {
            return;
        }

        if (currentUser) {
          this.userId = currentUser.uid;
          console.log("Autenticação Firebase: SUCESSO. UID:", this.userId);
          // Define o ID do app para uso em getPlaylistsCollectionPath
          (this as any).__app_id = appId; 
          this.loadPlaylists(); 
        } else {
          this.userId = null;
          this.playlists = [];
          this.isLoading = false;
          console.log("Autenticação Firebase: NENHUM usuário logado/anônimo.");
        }
        
        this.isAuthReady = true;
      });

    } catch (error) {
      console.error("Erro FATAL na inicialização do Firebase:", error);
      this.isLoading = false;
      this.isAuthReady = true;
    }
  }
  
  /**
   * Constrói o caminho da coleção privada do usuário.
   */
  private getPlaylistsCollectionPath(): string | null {
    if (!this.userId) return null;
    // O ID do app foi passado e armazenado em this.__app_id temporariamente para este método
    const appId = (this as any).__app_id || 'default-app-id'; 
    // Caminho: /artifacts/{appId}/users/{userId}/playlists
    return `artifacts/${appId}/users/${this.userId}/playlists`;
  }

  // --- Função CRUD: Read (Leitura em Tempo Real) ---
  
  /**
   * O 'R' do CRUD: Carrega playlists em tempo real usando onSnapshot.
   */
  loadPlaylists() {
    const path = this.getPlaylistsCollectionPath();
    if (!path) {
        this.isLoading = false;
        return; 
    }

    this.isLoading = true;
    
    // Cancela qualquer subscrição anterior para evitar vazamento de memória/duplicação
    if (this.playlistSubscription) {
      this.playlistSubscription.unsubscribe();
    }
    
    const q = query(collection(this.db, path), orderBy('createdAt', 'desc'));

    // Inicia o listener em tempo real
    const unsub = onSnapshot(q, (snapshot) => {
      this.playlists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Playlist[];
      this.isLoading = false;
      console.log(`Playlists carregadas: ${this.playlists.length}`);

      // Atualiza o objeto selectedPlaylist se ele estiver aberto
      if (this.selectedPlaylist) {
        const updated = this.playlists.find(p => p.id === this.selectedPlaylist!.id);
        if (updated) {
          this.selectedPlaylist = updated;
        }
      }

    }, (error) => {
      console.error("Erro ao carregar playlists (onSnapshot error):", error);
      this.isLoading = false;
    });
    
    // Armazena a nova subscrição
    this.playlistSubscription = new Subscription(() => unsub());
  }

  // --- Função CRUD: Create (Criação) ---

  /**
   * O 'C' do CRUD: Cria uma nova playlist.
   */
  async createPlaylist() {
    const path = this.getPlaylistsCollectionPath();
    if (!path || !this.newPlaylistName.trim()) {
      console.warn("Caminho ou nome da playlist inválido.");
      return;
    }

    try {
      await addDoc(collection(this.db, path), {
        name: this.newPlaylistName.trim(),
        description: this.newPlaylistDescription.trim(),
        tracks: [],
        userId: this.userId,
        createdAt: new Date(), 
      });
      
      this.newPlaylistName = '';
      this.newPlaylistDescription = '';
      this.isCreationModalOpen = false;
      console.log("Playlist criada com sucesso.");

    } catch (error) {
      console.error("Erro ao criar playlist:", error);
    }
  }

  // --- Funções CRUD: Update (Edição e Remoção de Música) ---

  /**
   * O 'U' do CRUD: Atualiza nome e descrição da playlist.
   */
  async updatePlaylistDetails() {
    if (!this.selectedPlaylist || !this.editingPlaylistName.trim()) {
      console.warn("Playlist selecionada ou nome inválido.");
      return;
    }
    
    const path = this.getPlaylistsCollectionPath();
    if (!path) return;

    try {
      const docRef = doc(this.db, path, this.selectedPlaylist.id);
      
      const updatedFields: { [key: string]: string } = {
        name: this.editingPlaylistName.trim(),
        description: this.editingPlaylistDescription.trim(),
      };

      await updateDoc(docRef, updatedFields);
      
      this.isEditModalOpen = false;
      console.log(`Playlist ${this.selectedPlaylist.id} atualizada.`);
      
      this.editingPlaylistName = '';
      this.editingPlaylistDescription = '';

    } catch (error) {
      console.error("Erro ao atualizar playlist:", error);
    }
  }

  /**
   * O 'U' do CRUD: Remove uma música específica de uma playlist.
   */
  async removeTrackFromPlaylist(playlist: Playlist, trackIndex: number) {
    if (trackIndex < 0 || trackIndex >= playlist.tracks.length) return;

    const updatedTracks = [...playlist.tracks];
    updatedTracks.splice(trackIndex, 1);

    const path = this.getPlaylistsCollectionPath();
    if (!path) return;

    try {
      const docRef = doc(this.db, path, playlist.id);
      await updateDoc(docRef, { tracks: updatedTracks });
      console.log(`Música removida da playlist ${playlist.name}.`);
      
    } catch (error) {
      console.error("Erro ao remover música:", error);
    }
  }
  
  // --- Função CRUD: Delete (Deletar) ---
  
  /**
   * O 'D' do CRUD: Deleta uma playlist.
   */
  async deletePlaylist(playlistId: string) {
    console.warn(`Tentando deletar playlist: ${playlistId}`); 
    
    const path = this.getPlaylistsCollectionPath();
    if (!path) return;

    try {
      const docRef = doc(this.db, path, playlistId);
      await deleteDoc(docRef);
      console.log(`Playlist ${playlistId} deletada.`);
      
      if (this.selectedPlaylist?.id === playlistId) {
          this.isDetailsModalOpen = false;
          this.selectedPlaylist = null;
      }
    } catch (error) {
      console.error("Erro ao deletar playlist:", error);
    }
  }

  // --- Funções de UI (Modais) ---
  
  setCreationModalOpen(isOpen: boolean) {
    this.isCreationModalOpen = isOpen;
  }

  openPlaylistDetails(playlist: Playlist) {
    this.selectedPlaylist = playlist;
    this.isDetailsModalOpen = true;
  }
  
  closePlaylistDetails() {
    this.isDetailsModalOpen = false;
    this.selectedPlaylist = null;
  }
  
  openEditModal(playlist: Playlist) {
    this.selectedPlaylist = playlist; 
    this.editingPlaylistName = playlist.name;
    this.editingPlaylistDescription = playlist.description;
    this.isDetailsModalOpen = false; 
    this.isEditModalOpen = true;    
  }
  
  closeEditModal() {
    this.isEditModalOpen = false;
    if (this.selectedPlaylist) {
        this.openPlaylistDetails(this.selectedPlaylist);
    }
  }
}
