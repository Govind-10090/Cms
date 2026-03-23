export type UserRole = 'Manager' | 'Store Keeper';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  lastUpdated: string;
  updatedBy: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
