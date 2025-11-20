import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface LastfmTrack {
  name: string;
  artist: string;
  url: string;
  listeners: number;
  image: string; 
}

@Injectable({
  providedIn: 'root'
})
export class LastfmService {
  private apiKey = '99367358d76ceb8387c28a03247560eb'; 
  private apiUrl = 'https://ws.audioscrobbler.com/2.0/';

  constructor(private http: HttpClient) {}

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
    const url = `${this.apiUrl}?method=track.getInfo&api_key=${this.apiKey}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json`;
    return this.http.get(url);
  }

  searchTracks(query: string): Observable<LastfmTrack[]> {
    const url = `${this.apiUrl}?method=track.search&track=${encodeURIComponent(query)}&api_key=${this.apiKey}&format=json`;

    return this.http.get<any>(url).pipe(
      map(data => {
        const tracksData = data.results?.trackmatches?.track || [];
        return tracksData.map((track: any): LastfmTrack => ({
          name: track.name || 'Título Desconhecido',
          artist: track.artist || 'Artista Desconhecido',
          url: track.url || '#',
          listeners: parseInt(track.listeners) || 0,
          image: (track.image?.find((img: any) => img.size === 'large')?.['#text']) || 'https://placehold.co/100x100/100085/ffffff?text=BUSCA'
        }));
      })
    );
  }
}
