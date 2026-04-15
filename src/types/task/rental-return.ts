import { StatusObject, Location, Attachment, Asset } from "./common";

// ============================================
// RENTAL RETURN DOCUMENT INTERFACES
// ============================================

export interface Customer {
    id: number;
    name: string;
    customer_type: "individual" | "organization";
    identifier: string;
    phone: string;
    email: string;
    address: string;
    description?: string;
    is_active: boolean;
}

export interface Rental {
    id: number;
    record_number: string;
    customer: Customer;
    contract_number: string;
    lease_date: string;
}

export interface RentalReturnDetailItem {
    id: number;
    asset_id: number;
    quantity: number;
    condition: string;
    asset: Asset;
}

export interface RentalReturnDocument {
    id: number;
    record_number: string;
    return_date: string;
    notes: string | null;
    to_location_id: number;
    to_location: Location;
    attachments: string[] | Attachment[];
    details: RentalReturnDetailItem[];
    status_obj: StatusObject;
    rental: Rental;
    creator?: {
        full_name: string;
    };
    created_at?: string;
}
