import {
    StatusObject,
    Location,
    Unit,
    User,
    Attachment,
    Asset,
} from "./common";
import { ICustomer } from "@/types/customer";

export interface RentalItemDetail {
    id: number;
    asset_id: number;
    asset: Asset;
    quantity: number;
    returned_quantity: number;
    rental_revenue: number;
    from_location_id: number;
    from_location: Location;
    lessee_location: string;
}

export interface RentalDocument {
    id: number;
    record_number: string;
    unit_id: number;
    customer_id: number;
    lease_date: string;
    duration_days: number;
    total_revenue: number;
    contract_number: string;
    notes: string;
    external_link: string;
    attachments: string[] | Attachment[];
    status_id: number;
    status_obj: StatusObject;
    unit: Unit;
    customer: ICustomer;
    details: RentalItemDetail[];
    creator_id: number;
    creator: User;
    created_at: string;
}
