import { Schema, model, Document } from 'mongoose';

export interface IMatchNotification extends Document {
  candidatId: string;
  candidateEmail: string;
  missionId: string;
  jobTitle?: string;
  score: number;
  sentAt: Date;
}

const matchNotificationSchema = new Schema<IMatchNotification>({
  candidatId: { type: String, required: true, index: true },
  candidateEmail: { type: String, required: true },
  missionId: { type: String, required: true, index: true },
  jobTitle: { type: String },
  score: { type: Number, required: true },
  sentAt: { type: Date, default: Date.now },
});

// Index unique composé pour empêcher tout doublon de notification pour une même offre et un même intérimaire
matchNotificationSchema.index({ candidatId: 1, missionId: 1 }, { unique: true });

export const MatchNotification = model<IMatchNotification>('MatchNotification', matchNotificationSchema);
