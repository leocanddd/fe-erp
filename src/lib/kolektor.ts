/**
 * Kolektor (Collection) Dashboard API
 *
 * This module provides API functions for the collection dashboard,
 * including receivables, performance metrics, visits, and funnel data.
 *
 * Based on the data contract from kolektor-dashboard.md:
 * - GET /collection/receivables?bucket=overdue|due2w
 * - GET /collection/performance?period=monthly|weekly
 * - GET /collection/visits?period=monthly|weekly
 * - GET /collection/funnel?period=monthly|weekly&collectors=1,2,3,4,5
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ====================== TYPES & INTERFACES ======================

export type Period = 'monthly' | 'weekly';
export type ReceivableBucket = 'overdue' | 'due2w';
export type SourceType = 'Retail' | 'Project' | 'Order';
export type StatusFilter = 'all' | 'outstanding' | 'due2w' | 'overdue' | 'paid';
export type ReminderStatus = 'none' | 'reminded' | 'promised' | 'disputed';

export interface Assignee {
	name: string;
	role: string;
	username?: string;
}

export interface SalespersonUser {
	_id: string; // MongoDB ObjectID
	username: string;
	firstName: string;
	lastName: string;
	role: number;
	name?: string; // Full name
}

export interface ReceivableItem {
	id: string; // e.g., "PO250061" or "INV250234"
	src: SourceType;
	client: string; // Company name
	subject?: string; // Project subject (for Project type)
	value: number; // Amount in Rupiah
	days: number; // Days overdue or days until due
	sales: string; // Sales person name
	assignee: Assignee | null; // Assigned collector or null if unassigned
}

export interface ReceivablesResponse {
	bucket: ReceivableBucket;
	items: ReceivableItem[];
	summary: {
		totalAmount: number;
		assignedCount: number;
		unassignedCount: number;
	};
}

export interface CollectorData {
	id: number; // 1-5
	name: string; // e.g., "Collector 1"
	value: number; // Collection amount
	visits?: number; // Number of visits
	percentage?: number; // Contribution percentage
}

export interface PerformanceMetrics {
	period: Period;
	periodLabel: string; // e.g., "June 2026"
	toBeCollected: {
		actual: number;
		target: number;
		percentage: number;
	};
	collected: {
		actual: number;
		target: number;
		percentage: number;
	};
	byCollector: CollectorData[];
}

export interface VisitMetrics {
	period: Period;
	target: number;
	actual: number;
	percentage: number;
	byCollector: Array<{
		id: number;
		name: string;
		visits: number;
		dailyAverage: number;
	}>;
	// Time series data for line charts
	timeSeries: {
		dates: string[]; // Array of date labels
		visits: {
			actual: number[];
			target: number[];
		};
		collected: {
			actual: number[]; // in millions (jt)
			target: number[]; // in millions (jt)
		};
	};
}

export interface FunnelStage {
	key: string; // 'Outstanding', 'Reminded', 'Promised', 'Collected'
	value: number; // Count for stages, money (Rp millions) for Collected
	isMoney?: boolean; // True for Collected stage
	target?: number; // Target value (for Collected stage)
}

export interface FunnelMetrics {
	period: Period;
	periodLabel: string;
	stages: FunnelStage[];
	// Conversion rates between stages
	conversions: {
		outstandingToReminded: number; // percentage
		remindedToPromised: number; // percentage
		promisedToCollected: number; // percentage
	};
	// Time series data per stage
	timeSeries: {
		dates: string[];
		outstanding: {
			actual: number[];
			target: number[];
		};
		reminded: {
			actual: number[];
			target: number[];
		};
		promised: {
			actual: number[];
			target: number[];
		};
		collected: {
			actual: number[];
			target: number[];
		};
	};
}

// ====================== AR (Accounts Receivable) TYPES ======================

export interface ARLineItem {
	name: string;
	qty: number;
	unit: string;
	total: number;
}

export interface ARItem {
	id: string; // e.g., "PO250065" or "DKI250065"
	_id?: string; // MongoDB ObjectID
	arItemId?: string; // Same as id, from backend
	orderId?: string; // Optional order ID
	source: SourceType; // 'Project' | 'Retail' | 'Order'
	client: string; // Company name
	contact?: string; // Customer contact
	subject?: string; // Project subject
	date: string; // Invoice date
	delivery: string; // Delivery date
	value: number; // Invoice amount
	sp: string; // Salesperson ObjectID
	status: 'outstanding' | 'due2w' | 'overdue' | 'paid';
	substatus?: string; // Additional status detail
	addr: string; // Delivery address
	items: ARLineItem[]; // Line items
	total: number; // Total amount
	// PO-only delivery/Tanda-Terima tracker:
	shipped?: boolean;
	shippedDate?: string | null;
	ttIssued?: boolean;
	ttDate?: string | null;
	// Collection workflow:
	remindStatus: ReminderStatus;
	remindCount: number;
	lastRemind?: string | null; // ISO date string
	collector?: string; // Collector name
	collectorNote?: string;
	noteDate?: string;
	createdBy?: string;
	username?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface ARSummary {
	total: number;
	outstanding: number;
	collected: number;
	target: number;
	targetProgress: number; // percentage
	bySalesperson: Array<{
		id: string; // Salesperson ObjectID
		outstanding: number;
	}>;
}

export interface ARListParams {
	sp: string[]; // Array of salesperson ObjectIDs
	status: StatusFilter;
	page: number;
}

export interface ARListResponse {
	rows: ARItem[];
	total: number;
}

interface ApiResponse<T> {
	status: string;
	statusCode: number;
	data?: T;
	error?: string;
	message?: string;
}

// ====================== API FUNCTIONS ======================

/**
 * Get receivables by bucket (overdue or due in 2 weeks)
 *
 * @param bucket - 'overdue' or 'due2w'
 * @returns Promise with receivables data
 *
 * @example
 * const overdue = await getReceivables('overdue');
 * const due2w = await getReceivables('due2w');
 */
export const getReceivables = async (
	bucket: ReceivableBucket
): Promise<ApiResponse<ReceivablesResponse>> => {
	try {
		const url = `${API_BASE_URL}/api/collection/receivables?bucket=${bucket}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: 'success',
				statusCode: 200,
				data: data.data,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.message || data.error || `Failed to fetch ${bucket} receivables`,
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: `Failed to fetch ${bucket} receivables: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
};

/**
 * Get collection performance metrics
 *
 * @param period - 'monthly' or 'weekly'
 * @returns Promise with performance metrics
 *
 * @example
 * const monthly = await getPerformanceMetrics('monthly');
 * const weekly = await getPerformanceMetrics('weekly');
 */
export const getPerformanceMetrics = async (
	period: Period = 'monthly'
): Promise<ApiResponse<PerformanceMetrics>> => {
	try {
		const url = `${API_BASE_URL}/api/collection/performance?period=${period}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: 'success',
				statusCode: 200,
				data: data.data,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.message || data.error || 'Failed to fetch performance metrics',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: `Failed to fetch performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
};

/**
 * Get collector visit metrics
 *
 * @param period - 'monthly' or 'weekly'
 * @returns Promise with visit metrics including time series
 *
 * @example
 * const visits = await getVisitMetrics('monthly');
 */
export const getVisitMetrics = async (
	period: Period = 'monthly'
): Promise<ApiResponse<VisitMetrics>> => {
	try {
		const url = `${API_BASE_URL}/api/collection/visits?period=${period}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: 'success',
				statusCode: 200,
				data: data.data,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.message || data.error || 'Failed to fetch visit metrics',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: `Failed to fetch visit metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
};

/**
 * Get collection funnel metrics
 *
 * @param period - 'monthly' or 'weekly'
 * @param collectors - Array of collector IDs to filter (1-5), or null for all
 * @returns Promise with funnel stage data and time series
 *
 * @example
 * // All collectors
 * const funnel = await getFunnelMetrics('monthly', null);
 *
 * // Specific collectors
 * const filtered = await getFunnelMetrics('monthly', [1, 3, 5]);
 */
export const getFunnelMetrics = async (
	period: Period = 'monthly',
	collectors: number[] | null = null
): Promise<ApiResponse<FunnelMetrics>> => {
	try {
		let url = `${API_BASE_URL}/api/collection/funnel?period=${period}`;

		if (collectors && collectors.length > 0) {
			url += `&collectors=${collectors.join(',')}`;
		}

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: 'success',
				statusCode: 200,
				data: data.data,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.message || data.error || 'Failed to fetch funnel metrics',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: `Failed to fetch funnel metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
};

/**
 * Assign a collector to a receivable
 *
 * @param receivableId - The receivable ID (e.g., "PO250061")
 * @param collectorUsername - The collector's username
 * @returns Promise with updated receivable data
 *
 * @example
 * const result = await assignCollector('PO250061', 'andi.collector');
 */
export const assignCollector = async (
	receivableId: string,
	collectorUsername: string
): Promise<ApiResponse<ReceivableItem>> => {
	try {
		const url = `${API_BASE_URL}/api/collection/receivables/${receivableId}/assign`;

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				collectorUsername,
			}),
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: 'success',
				statusCode: 200,
				data: data.data,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.message || data.error || 'Failed to assign collector',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: `Failed to assign collector: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
};

/**
 * Get list of available collectors
 *
 * @returns Promise with list of collectors
 *
 * @example
 * const collectors = await getCollectors();
 */
export const getCollectors = async (): Promise<ApiResponse<Assignee[]>> => {
	try {
		const url = `${API_BASE_URL}/api/collection/collectors`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: 'success',
				statusCode: 200,
				data: data.data,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.message || data.error || 'Failed to fetch collectors',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: `Failed to fetch collectors: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
};

/**
 * Get list of salespeople (users with role=2)
 *
 * @returns Promise with list of salesperson users
 *
 * @example
 * const salespeople = await getSalespeople();
 */
export const getSalespeople = async (): Promise<ApiResponse<SalespersonUser[]>> => {
	try {
		const url = `${API_BASE_URL}/api/users?role=2`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			// Transform data to add full name
			const users = data.data.map((user: SalespersonUser) => ({
				...user,
				name: `${user.firstName} ${user.lastName}`,
			}));

			return {
				status: 'success',
				statusCode: 200,
				data: users,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.message || data.error || 'Failed to fetch salespeople',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: `Failed to fetch salespeople: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
};

// ====================== UTILITY FUNCTIONS ======================

/**
 * Format currency value to Rupiah string
 *
 * @param value - Amount in Rupiah
 * @returns Formatted string (e.g., "Rp 1.2 M", "Rp 250 jt")
 */
export const formatCurrency = (value: number): string => {
	if (value >= 1000000000) {
		return `Rp ${(value / 1000000000).toFixed(1)} M`;
	}
	if (value >= 1000000) {
		return `Rp ${(value / 1000000).toFixed(0)} jt`;
	}
	return `Rp ${value.toLocaleString('id-ID')}`;
};

/**
 * Format percentage value
 *
 * @param value - Percentage (0-100)
 * @returns Formatted string (e.g., "75.5%")
 */
export const formatPercentage = (value: number): string => {
	return `${value.toFixed(1)}%`;
};

// ====================== AR API FUNCTIONS ======================

/**
 * Get AR (Accounts Receivable) list with filters
 *
 * @param params - Filter parameters (sp, status, page)
 * @returns Promise with AR list data
 *
 * @example
 * const result = await getARList({ sp: [1, 2, 3], status: 'overdue', page: 1 });
 */
export const getARList = async (
	params: ARListParams
): Promise<ApiResponse<ARListResponse>> => {
	try {
		const spParam = params.sp.join(',');
		const url = `${API_BASE_URL}/api/collection/ar?sp=${spParam}&status=${params.status}&page=${params.page}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: 'success',
				statusCode: 200,
				data: data.data,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.message || data.error || 'Failed to fetch AR list',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: `Failed to fetch AR list: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
};

/**
 * Get AR summary with aggregated values
 *
 * @param params - Filter parameters (sp)
 * @returns Promise with AR summary data
 *
 * @example
 * const summary = await getARSummary({ sp: ['68dde5fb85164c9d9f280cfe', '68dde5fb85164c9d9f280cff'] });
 */
export const getARSummary = async (params: {
	sp: string[];
}): Promise<ApiResponse<ARSummary>> => {
	try {
		const spParam = params.sp.join(',');
		const url = `${API_BASE_URL}/api/collection/ar/summary?sp=${spParam}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: 'success',
				statusCode: 200,
				data: data.data,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.message || data.error || 'Failed to fetch AR summary',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: `Failed to fetch AR summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
};

/**
 * Update reminder status for an AR item
 *
 * @param id - AR item ID
 * @param status - New reminder status
 * @returns Promise with updated AR item
 *
 * @example
 * const result = await updateReminderStatus('PO250065', 'reminded');
 */
export const updateReminderStatus = async (
	id: string,
	status: ReminderStatus
): Promise<ApiResponse<ARItem>> => {
	try {
		const url = `${API_BASE_URL}/api/collection/ar/${id}/remind`;

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ status }),
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: 'success',
				statusCode: 200,
				data: data.data,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.message || data.error || 'Failed to update reminder status',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: `Failed to update reminder status: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
};

/**
 * Send a reminder via WhatsApp or Email
 *
 * @param id - AR item ID
 * @param channel - Communication channel ('whatsapp' | 'email')
 * @returns Promise with send result
 *
 * @example
 * const result = await sendReminder('PO250065', 'whatsapp');
 */
export const sendReminder = async (
	id: string,
	channel: 'whatsapp' | 'email'
): Promise<ApiResponse<{ message: string }>> => {
	try {
		const url = `${API_BASE_URL}/api/collection/ar/${id}/send-reminder`;

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ channel }),
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: 'success',
				statusCode: 200,
				data: data.data,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.message || data.error || 'Failed to send reminder',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: `Failed to send reminder: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
};
