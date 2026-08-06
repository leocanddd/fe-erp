const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ||
	'http://localhost:3001';

export interface TeleBot {
	id?: string;
	_id?: string; // MongoDB uses _id
	employee_number: string;
	name: string;
	telegram_id: number;
	telegram_username: string;
	role: string;
	active: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateTeleBotData {
	employee_number: string;
	name: string;
	telegram_id: number;
	telegram_username: string;
	role: string;
	active: boolean;
}

export interface UpdateTeleBotData {
	employee_number: string;
	name: string;
	telegram_id: number;
	telegram_username: string;
	role: string;
	active: boolean;
}

interface ApiResponse<T> {
	statusCode: number;
	data?: T;
	error?: string;
	message?: string;
}

export const getTeleBots = async (): Promise<
	ApiResponse<TeleBot[]>
> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/telebots`,
			{
				method: 'GET',
				headers: {
					'Content-Type':
						'application/json',
				},
			}
		);

		const data = await response.json();

		if (
			data.status === 'success' &&
			data.statusCode === 200
		) {
			return {
				statusCode: 200,
				data: data.data,
			};
		} else {
			return {
				statusCode:
					data.statusCode ||
					response.status,
				error:
					data.message ||
					`HTTP error! status: ${response.status}`,
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to fetch telegram bot users',
		};
	}
};

export const getTeleBotById = async (
	id: string
): Promise<ApiResponse<TeleBot>> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/telebots/${id}`,
			{
				method: 'GET',
				headers: {
					'Content-Type':
						'application/json',
				},
			}
		);

		const data = await response.json();

		if (
			data.status === 'success' &&
			data.statusCode === 200
		) {
			return {
				statusCode: 200,
				data: data.data,
			};
		} else {
			return {
				statusCode:
					data.statusCode ||
					response.status,
				error:
					data.message ||
					'Failed to fetch telegram bot user',
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to fetch telegram bot user',
		};
	}
};

export const createTeleBot = async (
	botData: CreateTeleBotData
): Promise<ApiResponse<TeleBot>> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/telebots`,
			{
				method: 'POST',
				headers: {
					'Content-Type':
						'application/json',
				},
				body: JSON.stringify(botData),
			}
		);

		const data = await response.json();

		if (
			data.status === 'success' &&
			data.statusCode === 201
		) {
			return {
				statusCode: 201,
				data: data.data,
				message: data.message,
			};
		} else {
			return {
				statusCode:
					data.statusCode ||
					response.status,
				error:
					data.message ||
					'Failed to create telegram bot user',
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to create telegram bot user',
		};
	}
};

export const updateTeleBot = async (
	id: string,
	botData: UpdateTeleBotData
): Promise<ApiResponse<TeleBot>> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/telebots/${id}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type':
						'application/json',
				},
				body: JSON.stringify(botData),
			}
		);

		const data = await response.json();

		if (
			data.status === 'success' &&
			data.statusCode === 200
		) {
			return {
				statusCode: 200,
				data: data.data,
				message: data.message,
			};
		} else {
			return {
				statusCode:
					data.statusCode ||
					response.status,
				error:
					data.message ||
					'Failed to update telegram bot user',
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to update telegram bot user',
		};
	}
};

export const deleteTeleBot = async (
	id: string
): Promise<ApiResponse<null>> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/telebots/${id}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type':
						'application/json',
				},
			}
		);

		const data = await response.json();

		if (
			data.status === 'success' &&
			data.statusCode === 200
		) {
			return {
				statusCode: 200,
				message: data.message,
			};
		} else {
			return {
				statusCode:
					data.statusCode ||
					response.status,
				error:
					data.message ||
					'Failed to delete telegram bot user',
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to delete telegram bot user',
		};
	}
};
