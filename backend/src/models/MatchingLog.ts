import { Schema, model, Document } from 'mongoose';

export interface IMatchingLog extends Document {
  candidatId: string;
  missionId: string;
  score: number;
  candidateScore: number;
  recruiterScore: number;
  criteriaDetails: {
    salaryScore: number;
    scheduleScore: number;
    skillsScore: number;
    locationScore: number;
    durationScore: number;
  };
  createdAt: Date;
}

const matchingLogSchema = new Schema<IMatchingLog>({
  candidatId: { type: String, required: true },
  missionId: { type: String, required: true },
  score: { type: Number, required: true },
  candidateScore: { type: Number, required: true },
  recruiterScore: { type: Number, required: true },
  criteriaDetails: {
    salaryScore: { type: Number, required: true },
    scheduleScore: { type: Number, required: true },
    skillsScore: { type: Number, required: true },
    locationScore: { type: Number, required: true },
    durationScore: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now }
});

export const MatchingLog = model<IMatchingLog>('MatchingLog', matchingLogSchema);