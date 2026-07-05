// PO-specific API calls

// Salesperson mapping
export const SALESPEOPLE = {
	tonosutono: 'Tono Sutono',
	taufik: 'Taufik',
	feri: 'Feri',
} as const;

export type SalespersonUsername = keyof typeof SALESPEOPLE;

interface POItem {
	name: string;
	qty: number;
	unit: number;
	total: number;
}

interface PO {
	poId: string; // Changed from id to poId
	client: string;
	project: string;
	date: string;
	delivery: string;
	value: number;
	sp: string; // Changed from number to string (username)
	status: 'processing' | 'delivered' | 'cancelled';
	substatus: string;
	addr: string;
	dateAdded: string;
	deliveryFull: string;
	top: string;
	items: POItem[];
	total: number;
}

interface PerSales {
	rep: string; // Changed from number to string (username)
	count: number;
	value: number;
}

interface ValueSummary {
	total: number;
	processing: number;
	realized: number;
	target: number;
}

interface POResponse {
	perSales: PerSales[];
	value: ValueSummary;
	rows: PO[];
	total: number;
}

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

export const getPOs = async (
	usernames: string[] = ['tonosutono', 'taufik', 'feri'],
	status: string = 'all',
	page: number = 1,
	per: number = 10
): Promise<POResponse> => {
	try {
		const params = new URLSearchParams({
			usernames: usernames.join(','),
			status,
			page: page.toString(),
			per: per.toString(),
		});

		const response = await fetch(`${getApiUrl()}/project/po?${params}`, {
			method: 'GET',
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: POResponse = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching POs:', error);
		throw error;
	}
};

export interface CreatePORequest {
	client: string;
	project: string;
	date: string;
	delivery: string;
	value: number;
	username: string; // Changed from sp to username
	status: 'processing' | 'delivered' | 'cancelled';
	substatus: string;
	addr: string;
	dateAdded: string;
	deliveryFull: string;
	top: string;
	items: POItem[];
	total: number;
}

export const createPO = async (data: CreatePORequest): Promise<PO> => {
	try {
		const response = await fetch(`${getApiUrl()}/project/po`, {
			method: 'POST',
			headers: getAuthHeaders(),
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result: PO = await response.json();
		return result;
	} catch (error) {
		console.error('Error creating PO:', error);
		throw error;
	}
};

export interface UpdatePOStatusRequest {
	status: 'processing' | 'delivered' | 'cancelled';
	substatus: string;
	collector?: string; // Optional collector username (required when status is delivered)
}

export const updatePOStatus = async (poId: string, data: UpdatePOStatusRequest): Promise<PO> => {
	try {
		const response = await fetch(`${getApiUrl()}/project/po/${poId}`, {
			method: 'PUT',
			headers: getAuthHeaders(),
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result: PO = await response.json();
		return result;
	} catch (error) {
		console.error('Error updating PO status:', error);
		throw error;
	}
};

export type { PO, POItem, PerSales, ValueSummary, POResponse };
