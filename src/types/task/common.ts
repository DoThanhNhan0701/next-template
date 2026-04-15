// ============================================
// COMMON SHARED INTERFACES
// ============================================

export interface StatusObject {
    id: number;
    category: string;
    code: string;
    name: string;
    color: string;
    is_system: boolean;
}

export interface Location {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    is_active?: boolean;
}

export interface Unit {
    id: number;
    name: string;
    code: string;
    unit_type?: string;
    parent_id?: number | null;
    leader_id?: number | null;
    address?: string;
    description?: string;
    is_active?: boolean;
}

export interface Permission {
    id: number;
    name: string;
    code: string;
    description: string;
}

export interface Role {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    permissions: Permission[];
}

export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    role_id: number;
    unit_id: number;
    team_leader_id: number | null;
    is_active: boolean;
    role_obj?: Role;
}

export interface Staff {
    id: number;
    staff_code: string;
    full_name: string;
    email: string;
    phone: string;
    unit_id: number;
    is_active: boolean;
    created_at: string;
    unit?: Unit;
}

export interface Attachment {
    id?: number;
    file_name?: string;
    file_path: string;
    file_size?: number;
    file_type?: string;
    uploaded_at?: string;
}

export interface Asset {
    id: number;
    asset_code: string;
    name: string;
    holder_name?: string | null;
    unit_id?: number;
    location_id?: number | null;
    status_obj?: StatusObject;
    attachments?: string[] | Attachment[];
}
