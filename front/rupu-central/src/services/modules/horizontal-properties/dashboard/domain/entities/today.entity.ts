/** Resumen de hoy de una propiedad ("PH - Shell y Resumen", S1). */
export interface TodayInsideVisit {
  visitorName: string;
  visitType: string;
  unitNumber: string;
  unitBlock: string;
  entryTime: string;
  exceeded: boolean;
}

export interface TodayReservation {
  startTime: string;
  endTime: string;
  areaName: string;
  unitNumber: string;
  unitBlock: string;
  approved: boolean;
}

export interface TodayActiveVoting {
  groupId: number;
  groupName: string;
  votingId: number;
  title: string;
  votedUnits: number;
  totalUnits: number;
  quorumPercentage: number | null;
  attendanceByCoef: number | null;
}

export interface TodaySummary {
  visitsInside: TodayInsideVisit[];
  visitsInsideCount: number;
  visitsExceededCount: number;
  packagesPending: number;
  packagesOld: number;
  reservationsToday: TodayReservation[];
  reservationsPending: number;
  activeVoting: TodayActiveVoting | null;
  occupancy: {
    units: number;
    unitsWithResident: number;
    parkingSlots: number;
    parkingAssigned: number;
    residents: number;
    residentsWithEmail: number;
  };
}
