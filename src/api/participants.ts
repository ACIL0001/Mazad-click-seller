import { requests } from "./utils";

export const ParticipantsAPI = {
  getParticipants: () : Promise<any> => requests.get(`participant`),
  getParticipantsByBidId: (bidId: string) : Promise<any> => requests.get(`bid/${bidId}/participants`),
}