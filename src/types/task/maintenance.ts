import {
    StatusObject,
    Asset,
    User,
    Attachment,
} from "./common";

// ============================================
// MAINTENANCE DOCUMENT INTERFACES
// ============================================

export interface MaintenanceDetailItem {
    id: number;
    asset_id: number;
    asset: Asset;
    quantity: number;
    notes: string | null;
    from_location_id: number | null;
    from_staff_id: number | null;
    from_unit_id: number | null;
    return_to_location_id: number | null;
}

export interface MaintenanceDocument {
    id: number;
    record_number: string;
    ticket_number: string;
    reason: string;
    handover_person: string;
    taker_person_name: string;
    taker_phone: string;
    service_provider_name: string;
    service_provider_address: string;
    notes: string;
    expected_cost: number;
    actual_cost: number;
    external_link: string;
    attachments: string[] | Attachment[];
    create_date: string;
    created_at: string;
    outing_date: string;
    return_date: string;
    return_handover_person: string;
    status_id: number;
    status_obj: StatusObject;
    creator_id: number;
    creator: User;
    details: MaintenanceDetailItem[];
}
