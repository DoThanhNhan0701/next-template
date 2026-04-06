export interface IUser {
	id: number;
	username: string;
	full_name: string;
	email: string;
	role: string;
	permissions: string[];
	unit_id: number;
	is_active: boolean;
}
