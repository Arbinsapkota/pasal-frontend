export interface UserData {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    contact: number;
    userType: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string | null;
    profileImageUrl:string | null
    postalCode: number;
    state: string;
    country: string;
    city: string;
  }
  