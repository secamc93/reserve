/**
 * Entity: Vote (Voto)
 */

export interface Vote {
  id: number;
  votingId: number;
  votingOptionId: number;
  residentId: number;
  votedAt: string;
  ipAddress: string;
  userAgent: string;
  notes?: string;
}

export interface VotesList {
  votes: Vote[];
  total: number;
}

export interface CreateVoteDTO {
  votingId: number;
  votingOptionId: number;
  residentId: number;
  ipAddress: string;
  userAgent: string;
  notes?: string;
}

