export interface RentalReturnDocument {
    id: number
    record_number: string
    return_date: string
    notes: string
    to_location_id: number
    to_location: ToLocation
    attachments: (string | Attachment)[]
    details: Detail[]
    status_obj: StatusObj2
    rental: Rental
    creator?: {
        full_name: string
    }
    created_at?: string
}

interface Attachment {
    file_name: string
    file_path: string
}

interface ToLocation {
    name: string
    code: string
    description: string
    is_active: boolean
    id: number
}

interface Detail {
    id: number
    asset_id: number
    asset: Asset
    quantity: number
    condition: string
}

interface Asset {
    id: number
    asset_code: string
    name: string
    holder_name: string
    unit_id: number
    location_id: number
    status_obj: StatusObj
    attachments: string[]
}

interface StatusObj {
    id: number
    category: string
    code: string
    name: string
    color: string
    is_system: boolean
}

interface StatusObj2 {
    id: number
    category: string
    code: string
    name: string
    color: string
    is_system: boolean
}

interface Rental {
    id: number
    record_number: string
    customer: Customer
    contract_number: string
    lease_date: string
}

interface Customer {
    name: string
    customer_type: string
    identifier: string
    phone: string
    email: string
    address: string
    description: string
    is_active: boolean
    id: number
}
