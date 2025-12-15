const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CollectorVisit {
	id: string;
	username: string;
	name: string;
	store: string;
	location: string;
	startTime: string;
	endTime: string;
	description: string;
	orderId: string;
	createdAt: string;
	updatedAt: string;
}

export interface CollectorVisitsParams {
	page?: number;
	limit?: number;
	username?: string;
	startDate?: string;
	endDate?: string;
}

export interface PaginationData {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
}

interface ApiResponse<T> {
	status: string;
	statusCode: number;
	data?: T;
	pagination?: PaginationData;
	error?: string;
}

export const getCollectorVisits = async (
	params: CollectorVisitsParams = {}
): Promise<ApiResponse<CollectorVisit[]>> => {
	try {
		const searchParams = new URLSearchParams();

		if (params.page !== undefined) {
			searchParams.append('page', params.page.toString());
		}
		if (params.limit !== undefined) {
			searchParams.append('limit', params.limit.toString());
		}
		if (params.username) {
			searchParams.append('username', params.username);
		}
		if (params.startDate) {
			searchParams.append('startDate', params.startDate);
		}
		if (params.endDate) {
			searchParams.append('endDate', params.endDate);
		}

		const queryString = searchParams.toString();
		const url = `${API_BASE_URL}/api/collector-visits${
			queryString ? `?${queryString}` : ''
		}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: data.status,
				statusCode: 200,
				data: data.data,
				pagination: data.pagination,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.message || `HTTP error! status: ${response.status}`,
			};
		}
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Failed to fetch collector visits',
		};
	}
};

// Generate QR code URL for palet detail page
export const generatePaletQRCodeUrl = (paletId: string): string => {
	const baseUrl = typeof window !== 'undefined'
		? window.location.origin
		: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
	return `${baseUrl}/stocks/${paletId}`;
};
