const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Visit {
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

export interface VisitFilters {
	page?: number;
	limit?: number;
	username?: string;
	startDate?: string;
	endDate?: string;
}

export interface PaginationMeta {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export interface VisitsResponse {
	visits: Visit[];
	pagination: PaginationMeta;
}

interface ApiResponse<T> {
	statusCode: number;
	data?: T;
	error?: string;
}

export const getVisits = async (filters: VisitFilters = {}): Promise<ApiResponse<VisitsResponse>> => {
	try {
		const params = new URLSearchParams();

		// Add filters to query parameters
		if (filters.page) params.append('page', filters.page.toString());
		if (filters.limit) params.append('limit', filters.limit.toString());
		if (filters.username) params.append('username', filters.username);
		if (filters.startDate) params.append('startDate', filters.startDate);
		if (filters.endDate) params.append('endDate', filters.endDate);

		const queryString = params.toString();
		const url = `${API_BASE_URL}/api/visits${queryString ? `?${queryString}` : ''}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				statusCode: 200,
				data: {
					visits: data.data || [],
					pagination: data.pagination || {
						currentPage: 1,
						totalPages: 1,
						totalItems: 0,
						itemsPerPage: 10,
						hasNext: false,
						hasPrev: false,
					},
				},
			};
		} else {
			return {
				statusCode: data.statusCode || response.status,
				error: data.message || `HTTP error! status: ${response.status}`,
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to fetch visits',
		};
	}
};

export const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString('id-ID', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

export const formatDateInput = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toISOString().split('T')[0];
};

export const formatVisitDate = (visit: Visit): string => {
	const startDate = new Date(visit.startTime);

	const dateStr = startDate.toLocaleDateString('id-ID', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

	const startTime = startDate.toLocaleTimeString('id-ID', {
		hour: '2-digit',
		minute: '2-digit',
	});

	if (visit.endTime) {
		const endDate = new Date(visit.endTime);
		const endTime = endDate.toLocaleTimeString('id-ID', {
			hour: '2-digit',
			minute: '2-digit',
		});
		return `${dateStr}, ${startTime} - ${endTime}`;
	} else {
		return `${dateStr}, ${startTime} - Ongoing`;
	}
};

export const getVisitId = (visit: Visit): string => {
	return visit.id;
};

export const getVisitCreatedAt = (visit: Visit): string => {
	return visit.createdAt;
};