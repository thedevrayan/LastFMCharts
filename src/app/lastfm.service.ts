import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LastfmService {
  searchArtists(query: any) {
    throw new Error('Method not implemented.');
  }
  private apiKey = '99367358d76ceb8387c28a03247560eb'; // <-- COLOQUE SUA CHAVE AQUI
  private apiUrl = 'https://ws.audioscrobbler.com/2.0/';

  constructor(private http: HttpClient) {}

  // 1. Método para obter as Top Tracks globais
  getTopTracks(): Observable<any> {
    const params = {
      method: 'chart.gettoptracks',
      api_key: this.apiKey,
      format: 'json',
      limit: '100' 
    };
    return this.http.get(this.apiUrl, { params });
  }

  getTrackInfo(artist: string, track: string): Observable<any> {
    const url = `${this.apiUrl}/?method=track.getInfo&api_key=${this.apiKey}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json`;
    return this.http.get(url);
  }

  // 2. Método para buscar faixas
  searchTracks(trackName: string): Observable<any> {
    const params = {
      method: 'track.search',
      track: trackName,
      api_key: this.apiKey,
      format: 'json',
      limit: '10' // Limita a 10 resultados
    };
    return this.http.get(this.apiUrl, { params });
  }
}
