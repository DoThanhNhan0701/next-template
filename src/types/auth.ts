export interface IPermission {
	id: number;
	name: string;
	code: string;
	description: string;
}

export interface IRoleObj {
	id: number;
	name: string;
	description: string;
	is_active: boolean;
	permissions: IPermission[];
}

export interface IUser {
	id: number;
	username: string;
	full_name: string;
	email: string;
	role: string;
	role_id: number;
	unit_id: number | null;
	team_leader_id: number | null;
	is_active: boolean;
	role_obj?: IRoleObj;
	staff_code?: string | null
	permissions?: string[];
}
