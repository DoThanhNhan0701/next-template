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
// RECOVERY DOCUMENT INTERFACES
// ============================================

export interface RecoveryDetailItem {
    id: number;
    asset_id: number;
    location_id: number;
    quantity: number;
    asset: Asset;
    location: Location;
}

export interface RecoveryDocument {
    id: number;
    record_number: string;
    recovered_from_type: "user" | "unit";
    staff_id: number;
    recovered_from_name: string | null;
    recovery_date: string;
    notes: string | null;
    total_quantity: number;
    unit_id: number;
    unit: Unit;
    details: RecoveryDetailItem[];
    created_at: string;
    creator_id: number;
    external_link: string | null;
    creator: User;
    status_obj: StatusObject;
    staff: Staff;
    from_location_obj: Location | null;
    attachments: string[] | Attachment[];
}
