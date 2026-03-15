export interface WebMessage {
	_id: string;
	name: string;
	email: string;
	phone: string;
	company: string;
	message: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface WebMessagesResponse {
	data: WebMessage[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
