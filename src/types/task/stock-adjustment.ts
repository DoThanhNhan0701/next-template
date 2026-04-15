import {
    StatusObject,
    Location,
    User,
    Attachment,
    Asset,
} from "./common";

// ============================================
// STOCK ADJUSTMENT DOCUMENT INTERFACES
// ============================================

export interface StockDetailItem {
    id: number;
    asset_id: number;
    location_id: number;
    adjustment_type: "INCREASE" | "DECREASE";
    quantity_diff: number;
    notes: string | null;
    asset: Asset;
    location: Location;
}

export interface StockAdjustmentDocument {
    id: number;
    record_number: string;
    adjustment_date: string;
    reason: string;
    total_quantity: number;
    external_link: string | null;
    details: StockDetailItem[];
    attachments: string[] | Attachment[];
    status_obj: StatusObject;
    creator: User;
    created_at: string;
}
