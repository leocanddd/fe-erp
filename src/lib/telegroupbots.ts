const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ||
	'http://localhost:3001';

export interface TeleGroupBot {
	id?: string;
	_id?: string; // MongoDB uses _id
	groupName: string;
	chatId: number;
	category: string;
	active: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateTeleGroupBotData {
	groupName: string;
	chatId: number;
	category: string;
}

export interface UpdateTeleGroupBotData {
	groupName: string;
	chatId: number;
	category: string;
}

interface ApiResponse<T> {
	statusCode: number;
	data?: T;
	error?: string;
	message?: string;
}

export const getTeleGroupBots = async (): Promise<
	ApiResponse<TeleGroupBot[]>
> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/telegroupbots`,
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
			error: 'Failed to fetch telegram group bots',
		};
	}
};

export const getTeleGroupBotById = async (
	id: string
): Promise<ApiResponse<TeleGroupBot>> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/telegroupbots/${id}`,
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
					'Failed to fetch telegram group bot',
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to fetch telegram group bot',
		};
	}
};

export const createTeleGroupBot = async (
	groupBotData: CreateTeleGroupBotData
): Promise<ApiResponse<TeleGroupBot>> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/telegroupbots`,
			{
				method: 'POST',
				headers: {
					'Content-Type':
						'application/json',
				},
				body: JSON.stringify(groupBotData),
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
					'Failed to create telegram group bot',
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to create telegram group bot',
		};
	}
};

export const updateTeleGroupBot = async (
	id: string,
	groupBotData: UpdateTeleGroupBotData
): Promise<ApiResponse<TeleGroupBot>> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/telegroupbots/${id}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type':
						'application/json',
				},
				body: JSON.stringify(groupBotData),
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
					'Failed to update telegram group bot',
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to update telegram group bot',
		};
	}
};

export const deleteTeleGroupBot = async (
	id: string
): Promise<ApiResponse<null>> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/telegroupbots/${id}`,
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
					'Failed to delete telegram group bot',
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to delete telegram group bot',
		};
	}
};
