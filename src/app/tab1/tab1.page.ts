import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { LastfmService } from '../lastfm.service';
import { CommonModule } from '@angular/common'; 
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule],
})
export class Tab1Page implements OnInit {
  
  private lastfmService = inject(LastfmService); 

  topTracks: any[] = [];
  loading = true;

  constructor() {}

  ngOnInit() {
    this.loadTopTracks();
  }

  loadTopTracks() {
    this.lastfmService.getTopTracks().subscribe({
      next: (data) => {
        // Acessa o array de faixas no JSON retornado
        this.topTracks = data.tracks?.track;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar Top Tracks:', err);
        this.loading = false;
        // Tratar erro aqui (ex: mostrar mensagem ao usuário)
      }
    });
    
  }
}