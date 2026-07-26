import type {
	NextApiRequest,
	NextApiResponse,
} from 'next';

const BACKEND_URL = process.env.API_URL || 'http://localhost:8080';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const token =
		req.headers.authorization;

	try {
		if (req.method === 'GET') {
			// Get all blogsssss
			// Forward query params to backend
			const queryParams = new URLSearchParams();
			if (req.query.page) queryParams.append('page', req.query.page as string);
			if (req.query.limit) queryParams.append('limit', req.query.limit as string);
			if (req.query.isApproved) queryParams.append('isApproved', req.query.isApproved as string);

			const queryString = queryParams.toString();
			const url = `${BACKEND_URL}/api/blogs${queryString ? `?${queryString}` : ''}`;

			const response = await fetch(
				url,
				{
					headers: {
						Authorization: token || '',
					},
				}
			);

			if (!response.ok) {
				const error =
					await response.json();
				return res
					.status(response.status)
					.json(error);
			}

			const data =
				await response.json();
			return res.status(200).json(data);
		} else if (req.method === 'POST') {
			// Create new blog
			const response = await fetch(
				`${BACKEND_URL}/api/blogs`,
				{
					method: 'POST',
					headers: {
						'Content-Type':
							'application/json',
						Authorization: token || '',
					},
					body: JSON.stringify(
						req.body
					),
				}
			);

			if (!response.ok) {
				const error =
					await response.json();
				return res
					.status(response.status)
					.json(error);
			}

			const data =
				await response.json();
			return res.status(201).json(data);
		} else {
			return res
				.status(405)
				.json({
					message: 'Method not allowed',
				});
		}
	} catch (error) {
		console.error(
			'Blog API error:',
			error
		);
		return res
			.status(500)
			.json({
				message:
					'Internal server error',
			});
	}
}
