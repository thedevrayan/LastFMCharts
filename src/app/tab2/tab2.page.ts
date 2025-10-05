import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { LastfmService } from '../lastfm.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importa para usar ngModel

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule], // Adiciona FormsModule
})
export class Tab2Page {
  private lastfmService = inject(LastfmService);

  searchTerm: string = '';
  searchResults: any[] = [];
  isSearching = false;

  constructor() {}

  onSearch() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    this.lastfmService.searchTracks(this.searchTerm).subscribe({
      next: (data) => {
        // A estrutura de resposta da busca é um pouco diferente
        this.searchResults = data.results.trackmatches.track;
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Erro ao buscar faixas:', err);
        this.isSearching = false;
      }
    });
  }
}