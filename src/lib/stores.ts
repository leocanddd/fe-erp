interface Store {
	id?: string;
	name: string;
	location: string;
	pic: string;
	contact: string;
	limit: number;
	description: string;
	totalVisit: number;
	createdAt?: string;
	updatedAt?: string;
}

interface StoreCreateRequest {
	name: string;
	location: string;
	pic: string;
	contact: string;
	limit: number;
	description: string;
	totalVisit: number;
}

interface StoreResponse {
	status: string;
	statusCode: number;
	message?: string;
	data?: Store;
	error?: string;
}

interface StoresListResponse {
	status: string;
	statusCode: number;
	data: Store[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
	error?: string;
}

const getApiUrl = () => {
	return (
		process.env.NEXT_PUBLIC_API_URL ||
		'http://localhost:8080'
	);
};

const getAuthHeaders = () => {
	const token = localStorage.getItem(
		'accessToken'
	);
	return {
		'Content-Type': 'application/json',
		...(token && {
			Authorization: `Bearer ${token}`,
		}),
	};
};

export const createStore = async (
	store: StoreCreateRequest
): Promise<StoreResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/stores`,
			{
				method: 'POST',
				headers: getAuthHeaders(),
				body: JSON.stringify(store),
			}
		);

		const data: StoreResponse =
			await response.json();
		return data;
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Network error occurred',
		};
	}
};

export const getStores = async (
	page: number = 1,
	limit: number = 10,
	name: string = ''
): Promise<StoresListResponse> => {
	const emptyResponse: StoresListResponse =
		{
			status: 'error',
			statusCode: 500,
			data: [],
			pagination: {
				currentPage: page,
				totalPages: 0,
				totalItems: 0,
				itemsPerPage: limit,
			},
			error: 'Unknown error',
		};

	try {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
			...(name && { name }),
		});

		const response = await fetch(
			`${getApiUrl()}/api/stores?${params}`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			}
		);

		// 🧩 Safari-safe: read as text, then safely parse
		const text = await response.text();
		if (!text) {
			return {
				...emptyResponse,
				statusCode: response.status,
				error:
					'Empty response from server',
			};
		}

		let parsed: StoresListResponse;
		try {
			parsed = JSON.parse(
				text
			) as StoresListResponse;
		} catch {
			console.warn(
				'⚠️ Invalid JSON from /api/stores:',
				text
			);
			return {
				...emptyResponse,
				statusCode: 500,
				error:
					'Invalid JSON response from server',
			};
		}

		// 🧩 Handle non-OK HTTP
		if (!response.ok) {
			return {
				...emptyResponse,
				statusCode: response.status,
				error:
					parsed.error ||
					`Failed to fetch stores (HTTP ${response.status})`,
			};
		}

		return parsed;
	} catch (err: unknown) {
		const message =
			err instanceof Error
				? err.message
				: 'Client exception — network request failed';
		console.error(
			'❌ getStores failed:',
			message
		);

		return {
			...emptyResponse,
			error: message,
		};
	}
};

// export const getStores = async (
//   page: number = 1,
//   limit: number = 10,
//   name: string = ''
// ): Promise<StoresListResponse> => {
//   try {
//     const params = new URLSearchParams({
//       page: page.toString(),
//       limit: limit.toString(),
//       ...(name && { name }),
//     });

//     const response = await fetch(`${getApiUrl()}/api/stores?${params}`, {
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });

//     const data: StoresListResponse = await response.json();
//     return data;
//   } catch {
//     return {
//       status: 'error',
//       statusCode: 500,
//       data: [],
//       pagination: {
//         currentPage: 1,
//         totalPages: 0,
//         totalItems: 0,
//         itemsPerPage: limit,
//       },
//       error: 'Network error occurred',
//     };
//   }
// };

export const getStore = async (
	id: string
): Promise<StoreResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/stores/${id}`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			}
		);

		const data: StoreResponse =
			await response.json();
		return data;
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Network error occurred',
		};
	}
};

export const updateStore = async (
	id: string,
	store: Partial<StoreCreateRequest>
): Promise<StoreResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/stores/${id}`,
			{
				method: 'PUT',
				headers: getAuthHeaders(),
				body: JSON.stringify(store),
			}
		);

		const data: StoreResponse =
			await response.json();
		return data;
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Network error occurred',
		};
	}
};

export const deleteStore = async (
	id: string
): Promise<StoreResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/stores/${id}`,
			{
				method: 'DELETE',
				headers: getAuthHeaders(),
			}
		);

		const data: StoreResponse =
			await response.json();
		return data;
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Network error occurred',
		};
	}
};

export const getTop10Stores =
	async (): Promise<StoresListResponse> => {
		try {
			const response = await fetch(
				`${getApiUrl()}/api/stores/top10`,
				{
					method: 'GET',
					headers: getAuthHeaders(),
				}
			);

			const data: StoresListResponse =
				await response.json();
			return data;
		} catch {
			return {
				status: 'error',
				statusCode: 500,
				data: [],
				pagination: {
					currentPage: 1,
					totalPages: 0,
					totalItems: 0,
					itemsPerPage: 10,
				},
				error: 'Network error occurred',
			};
		}
	};

export type {
	Store,
	StoreCreateRequest,
	StoreResponse,
	StoresListResponse,
};
