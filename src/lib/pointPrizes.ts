import {
	PointPrize,
	PointPrizeResponse,
	PointPrizesResponse,
} from '@/types/pointPrize';

const getApiUrl = () => {
	return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
};

const getAuthHeaders = () => {
	const token = localStorage.getItem('accessToken');
	return {
		'Content-Type': 'application/json',
		...(token && {
			Authorization: `Bearer ${token}`,
		}),
	};
};

export async function getPointPrizes(
	page: number = 1,
	limit: number = 10,
	search: string = '',
): Promise<PointPrizesResponse> {
	try {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
			...(search && { search }),
		});

		const response = await fetch(`${getApiUrl()}/api/point-prizes?${params}`, {
			headers: getAuthHeaders(),
		});

		return await response.json();
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			data: [],
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

export async function getPointPrizeById(
	id: string,
): Promise<PointPrizeResponse> {
	try {
		const response = await fetch(`${getApiUrl()}/api/point-prizes/${id}`, {
			headers: getAuthHeaders(),
		});

		return await response.json();
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

export async function createPointPrize(
	pointPrize: Omit<PointPrize, '_id' | 'createdAt' | 'updatedAt'>,
): Promise<PointPrizeResponse> {
	try {
		const response = await fetch(`${getApiUrl()}/api/point-prizes`, {
			method: 'POST',
			headers: getAuthHeaders(),
			body: JSON.stringify(pointPrize),
		});

		return await response.json();
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

export async function updatePointPrize(
	id: string,
	pointPrize: Omit<PointPrize, '_id' | 'createdAt' | 'updatedAt'>,
): Promise<PointPrizeResponse> {
	try {
		const response = await fetch(`${getApiUrl()}/api/point-prizes/${id}`, {
			method: 'PUT',
			headers: getAuthHeaders(),
			body: JSON.stringify(pointPrize),
		});

		return await response.json();
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

export async function deletePointPrize(
	id: string,
): Promise<PointPrizeResponse> {
	try {
		const response = await fetch(`${getApiUrl()}/api/point-prizes/${id}`, {
			method: 'DELETE',
			headers: getAuthHeaders(),
		});

		return await response.json();
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}
