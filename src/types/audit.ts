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
    submitted_at: string | null;
}

export interface IAuditDetailItem {
    id: number;
    audit_session_id: number;
    asset_id: number;
    status_id: number;
    notes: string | null;
    proposed_action: string | null;
    transfer_quantity: number | null;
    target_unit_id: number | null;
    target_staff_id: number | null;
    target_holder_name: string | null;
    target_location_id: number | null;
    verified_at: string;
    status_obj: IStatus;
    asset: {
        id: number;
        asset_code: string;
        name: string;
        holder_name: string;
        unit_id: number;
        location_id: number | null;
        status_obj: IStatus;
        attachments: string[];
    };
    target_staff: IUser | null;
    unit_quantity: number;
}

// API Response types
export type IMyAuditsResponse = IAuditSession[] | { items: IAuditSession[]; total?: number; count?: number; };
export type IAllAuditsResponse = IAuditSession[] | { items: IAuditSession[]; total?: number; count?: number; };
export type IAuditDetailsResponse = IAuditDetailItem[];
