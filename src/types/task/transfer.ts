import { StatusObject, Attachment } from "./common";

// ============================================
// TRANSFER DOCUMENT INTERFACES
// ============================================

export interface TransferDetailItem {
    id: number;
    asset_id: number;
    asset_name: string;
    asset_code: string;
    quantity: number;
    from_location_id: number;
    from_location_name: string;
}

export interface TransferDocument {
    id: number;
    record_number: string;
    transfer_type: "holder" | "location" | "unit";
    transfer_date: string;
    reason: string;
    total_assets: number;
    external_link: string | null;
    status_obj: StatusObject;
    details: TransferDetailItem[];
    attachments: string[] | Attachment[];
    from_name: string;
    to_name: string;
    creator?: {
        full_name: string;
    };
    created_at?: string;
}
