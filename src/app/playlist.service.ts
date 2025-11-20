import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface Track {
  name: string;
  artist: string;
  image: string;
  addedAt: string;
}

export interface Playlist {
  _id?: string;
  name: string;
  description?: string;
  createdAt: Date;
  tracks: Track[];
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  addTrack(playlistId: string, track: string): Observable<unknown> {
    throw new Error('Method not implemented.');
  }

  private apiUrl = 'http://localhost:3000/api/playlists'; 

  playlistsUpdated = new Subject<void>();

  constructor(private http: HttpClient) {}

  getAll(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(this.apiUrl);
  }

  create(data: Partial<Playlist>): Observable<Playlist> {
    return this.http.post<Playlist>(this.apiUrl, data);
  }

  update(id: string, data: Partial<Playlist>): Observable<Playlist> {
    return this.http.put<Playlist>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addTrackToPlaylist(id: string, track: Track): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.apiUrl}/${id}/tracks`, track);
  }

  removeTrackFromPlaylist(playlistId: string, trackName: string): Observable<Playlist> {
    return this.http.delete<Playlist>(
      `${this.apiUrl}/${playlistId}/tracks/${encodeURIComponent(trackName)}`
    );
  }
}