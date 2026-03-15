export interface PointPrize {
	_id?: string;
	title: string;
	description: string;
	pointsRequired: number;
	image?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface PointPrizeResponse {
	status: string;
	statusCode: number;
	message?: string;
	data?: PointPrize;
	error?: string;
}

export interface PointPrizesResponse {
	status: string;
	statusCode: number;
	data: PointPrize[];
	error?: string;
}
