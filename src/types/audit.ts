import { IUser } from "./auth";
import { IStatus } from "./status";

// Unit object interface (simplified version of IOrgUnit)
export interface IAuditUnitObj {
    id: number;
    name: string;
}

// Location object interface (simplified version of ILocation)
export interface IAuditLocationObj {
    id: number;
    name: string;
}

// Main Audit Session interface
export interface IAuditSession {
    id: number;
    title: string;
    due_date: string;
    audit_type: "unit" | "location";
    unit_id: number | null;
    location_id: number | null;
    assignee_id: number;
    created_at: string;
    status_id: number;
    status_obj: IStatus;
    creator_id: number;
    assignee: IUser;
    unit_obj: IAuditUnitObj | null;
    location_obj: IAuditLocationObj | null;
}

// API Response types
export type IMyAuditsResponse = IAuditSession[];
export type IAllAuditsResponse = IAuditSession[];
