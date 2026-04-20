import { StatusObject, Location, Asset } from "./common";

// ============================================
// LIQUIDATION DOCUMENT INTERFACES
// ============================================

export interface LiquidationDetailItem {
    id: number;
    asset: Asset;
    quantity: number;
    unit_value: number;
    remaining_value: number;
    notes: string | null;
    from_location_id: number;
    from_location: Location;
}

export interface LiquidationDocument {
    id: number;
    record_number: string;
    liquidation_date: string;
    liquidation_type: string;
    reason: string | null;
    committee: string | null;
    total_value: number;
    buyer_name: string | null;
    notes: string | null;
    external_link: string | null;
    attachments: string[];
    details: LiquidationDetailItem[];
    creator_id: number;
    creator: {
        full_name: string;
        username: string;
        email: string;
    };
    status_id: number;
    status_obj: StatusObject;
    created_at?: string;
}
