import { Schema, model, Document } from 'mongoose';

export interface IMatchingLog extends Document {
  candidatId: string;
  missionId: string;
  score: number;
  createdAt: Date;
}

const matchingLogSchema = new Schema<IMatchingLog>({
  candidatId: { type: String, required: true },
  missionId: { type: String, required: true },
  score: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const MatchingLog = model<IMatchingLog>('MatchingLog', matchingLogSchema);