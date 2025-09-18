export interface Participant {
  _id?: string;
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  bid: {
    _id: string;
    title: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ParticipantFormData {
  // Add any form data fields if needed
}