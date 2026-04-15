import {
    StatusObject,
    Location,
    Unit,
    User,
    Staff,
    Attachment,
    Asset,
} from "./common";

// ============================================
// ALLOCATION DOCUMENT INTERFACES
// ============================================

export interface AllocationDetailItem {
    id: number;
    asset_id: number;
    location_id: number;
    quantity: number;
    notes?: string | null;
    asset: Asset;
    location: Location;
}

export interface AllocationDocument {
    id: number;
    record_number: string;
    allocated_to_type: "user" | "unit";
    staff_id?: number;
    allocated_to_name: string;
    allocation_date: string;
    reason: string;
    total_quantity: number;
    unit_id: number;
    unit: Unit;
    issuer_id: number;
    issuer_name: string;
    location_id: number | null;
    location_name: string | null;
    details: AllocationDetailItem[];
    creator_id: number;
    external_link: string | null;
    attachments: string[] | Attachment[];
    creator: User;
    issuer: User;
    status_obj: StatusObject;
    staff?: Staff;
    created_at: string;
}
