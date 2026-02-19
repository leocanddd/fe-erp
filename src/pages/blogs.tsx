import MainLayout from '@/components/MainLayout';
import { getStoredUser } from '@/lib/auth';
import { getMenuPermissions } from '@/lib/navigation';
import { Blog } from '@/types/blog';
import { useRouter } from 'next/router';
import {
	useEffect,
	useState,
} from 'react';

export default function Blogs() {
	const router = useRouter();
	const [blogs, setBlogs] = useState<
		Blog[]
	>([]);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] =
		useState('');
	const [
		deleteLoading,
		setDeleteLoading,
	] = useState<string | null>(null);
	const [
		approveLoading,
		setApproveLoading,
	] = useState<string | null>(null);
	const [
		canApproveBlog,
		setCanApproveBlog,
	] = useState(false);

	useEffect(() => {
		const user = getStoredUser();
		if (user) {
			const permissions = getMenuPermissions();
			const approveRoles = permissions['/blogs/approve'] ?? [5, 12];
			setCanApproveBlog(approveRoles.includes(user.role));
		}
		fetchBlogs();
	}, []);

	const fetchBlogs = async () => {
		setLoading(true);
		try {
			const token =
				localStorage.getItem('token');
			const response = await fetch(
				'/api/blogs',
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(
					'Failed to fetch blogs',
				);
			}

			const data =
				await response.json();
			console.log(
				'Backend response:',
				data,
			);
			const blogsData =
				data.data || data || [];
			console.log(
				'Blogs data:',
				blogsData,
			);
			// Ensure all blogs have _id field (some backends use id instead)
			const normalizedBlogs =
				Array.isArray(blogsData)
					? blogsData.map(
							(
								blog: Blog & {
									id?: string;
								},
							) => ({
								...blog,
								_id:
									blog._id ||
									blog.id ||
									'',
							}),
						)
					: [];
			console.log(
				'Normalized blogs:',
				normalizedBlogs,
			);
			setBlogs(normalizedBlogs);
			setError('');
		} catch (err) {
			console.error(
				'Error fetching blogs:',
				err,
			);
			setError('Failed to fetch blogs');
			setBlogs([]);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (
		id: string,
	) => {
		if (
			!confirm(
				'Are you sure you want to delete this blog?',
			)
		) {
			return;
		}

		setDeleteLoading(id);
		try {
			const token =
				localStorage.getItem('token');
			const response = await fetch(
				`/api/blogs/${id}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(
					'Failed to delete blog',
				);
			}

			fetchBlogs();
		} catch (err) {
			console.error(
				'Error deleting blog:',
				err,
			);
			alert('Failed to delete blog');
		} finally {
			setDeleteLoading(null);
		}
	};

	const handleApprove = async (
		id: string,
		currentStatus: boolean,
	) => {
		const newStatus = !currentStatus;

		setApproveLoading(id);
		try {
			const token =
				localStorage.getItem('token');
			const response = await fetch(
				`/api/blogs/${id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type':
							'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						isApproved: newStatus,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(
					'Failed to update approval status',
				);
			}

			fetchBlogs();
		} catch (err) {
			console.error(
				'Error updating approval status:',
				err,
			);
			alert(
				'Failed to update approval status',
			);
		} finally {
			setApproveLoading(null);
		}
	};

	const formatDate = (
		dateString: string,
	) => {
		return new Date(
			dateString,
		).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<MainLayout title="Blogs">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8 flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Blogs
						</h2>
						<p className="text-gray-600">
							Kelola blog dan artikel
						</p>
					</div>
					<button
						onClick={() =>
							router.push('/blogs/new')
						}
						className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
					>
						+ Tambah Blog
					</button>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
						<div className="text-sm text-red-600 font-medium">
							{error}
						</div>
					</div>
				)}

				{/* Blogs Grid */}
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
					{loading ? (
						<div className="p-8 text-center">
							<div className="inline-flex items-center space-x-3">
								<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
								<span className="text-gray-600">
									Memuat blogs...
								</span>
							</div>
						</div>
					) : blogs.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							Tidak ada blog yang
							ditemukan
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
							{blogs.map((blog) => (
								<div
									key={blog._id}
									className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
								>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={blog.image}
										alt={blog.title}
										className="w-full h-48 object-cover"
									/>
									<div className="p-4">
										<div className="flex items-center justify-between mb-2">
											<span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
												{blog.category}
											</span>
											{blog.isApproved ? (
												<span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full">
													✓ Approved
												</span>
											) : (
												<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
													Pending
												</span>
											)}
										</div>
										<h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
											{blog.title}
										</h3>
										<p className="text-sm text-gray-600 mb-3 line-clamp-2">
											{blog.description}
										</p>
										<div className="flex items-center justify-between text-xs text-gray-500 mb-4">
											<span>
												{blog.author}
											</span>
											<span>
												{formatDate(
													blog.publishDate,
												)}
											</span>
										</div>
										<div className="flex flex-wrap gap-1 mb-4">
											{blog.tags
												.slice(0, 3)
												.map(
													(
														tag,
														index,
													) => (
														<span
															key={
																index
															}
															className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
														>
															{tag}
														</span>
													),
												)}
											{blog.tags
												.length > 3 && (
												<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
													+
													{blog.tags
														.length - 3}
												</span>
											)}
										</div>
										<div className="flex flex-col space-y-2">
											<div className="flex space-x-2">
												<button
													onClick={() =>
														router.push(
															`/blogs/edit/${blog._id}`,
														)
													}
													className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
												>
													Edit
												</button>
												<button
													onClick={() =>
														handleDelete(
															blog._id,
														)
													}
													disabled={
														deleteLoading ===
														blog._id
													}
													className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
												>
													{deleteLoading ===
													blog._id
														? 'Deleting...'
														: 'Delete'}
												</button>
											</div>
											{canApproveBlog && (
												<button
													onClick={() => {
														console.log(
															'Blog object:',
															blog,
														);
														console.log(
															'blog.isApproved:',
															blog.isApproved,
														);
														console.log(
															'Passing to handleApprove:',
															blog.isApproved ||
																false,
														);
														handleApprove(
															blog._id,
															blog.isApproved ||
																false,
														);
													}}
													disabled={
														approveLoading ===
														blog._id
													}
													className={`w-full px-4 py-2 ${
														blog.isApproved
															? 'bg-yellow-600 hover:bg-yellow-700'
															: 'bg-green-600 hover:bg-green-700'
													} text-white rounded-lg disabled:opacity-50 transition-colors text-sm font-medium`}
												>
													{approveLoading ===
													blog._id
														? 'Loading...'
														: blog.isApproved
															? 'Unapprove'
															: 'Approve'}
												</button>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Summary */}
				{!loading &&
					blogs.length > 0 && (
						<div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
							<div className="text-sm text-gray-600">
								Total blogs:{' '}
								<span className="font-semibold text-gray-900">
									{blogs.length}
								</span>
							</div>
						</div>
					)}
			</div>
		</MainLayout>
	);
}
