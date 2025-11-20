import mongoose, { Schema, Document } from 'mongoose';

export interface Track {
  name: string;
  artist: string;
  image?: string;
  addedAt?: string;
}

export interface Playlist extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  tracks: Track[];
}

const TrackSchema = new Schema<Track>({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  image: { type: String },
  addedAt: { type: String },
});

const PlaylistSchema = new Schema<Playlist>({
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  tracks: [TrackSchema], // 👈 importante!
});

export const PlaylistModel = mongoose.model<Playlist>('Playlist', PlaylistSchema);
