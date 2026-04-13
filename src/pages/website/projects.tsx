import MainLayout from '@/components/MainLayout';
import { getStoredUser } from '@/lib/auth';
import { useRouter } from 'next/router';
import {
	useEffect,
	useState,
} from 'react';

interface WebProject {
	_id: string;
	id?: string;
	title: string;
	product: string;
	client: string;
	category: string;
	image: string;
}

export default function WebProjects() {
	const router = useRouter();
	const [projects, setProjects] = useState<
		WebProject[]
	>([]);
	const [loading, setLoading] =
		useState(true);
	const [error, setError] =
		useState('');
	const [
		deleteLoading,
		setDeleteLoading,
	] = useState<string | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [editingProject, setEditingProject] = useState<WebProject | null>(null);
	const [formData, setFormData] = useState({
		title: '',
		product: '',
		client: '',
		category: '',
		image: '',
	});
	const [submitLoading, setSubmitLoading] = useState(false);

	useEffect(() => {
		fetchProjects();
	}, []);

	const fetchProjects = async () => {
		setLoading(true);
		try {
			const token =
				localStorage.getItem('token');
			const response = await fetch(
				'/api/web-projects',
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(
					'Failed to fetch projects',
				);
			}

			const data =
				await response.json();
			const projectsData =
				data.data || data || [];
			// Ensure all projects have _id field (some backends use id instead)
			const normalizedProjects =
				Array.isArray(projectsData)
					? projectsData.map(
							(
								project: WebProject & {
									id?: string;
								},
							) => ({
								...project,
								_id:
									project._id ||
									project.id ||
									'',
							}),
						)
					: [];
			setProjects(normalizedProjects);
			setError('');
		} catch (err) {
			console.error(
				'Error fetching projects:',
				err,
			);
			setError('Failed to fetch projects');
			setProjects([]);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (
		id: string,
	) => {
		if (
			!confirm(
				'Are you sure you want to delete this project?',
			)
		) {
			return;
		}

		setDeleteLoading(id);
		try {
			const token =
				localStorage.getItem('token');
			const response = await fetch(
				`/api/web-projects/${id}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(
					'Failed to delete project',
				);
			}

			fetchProjects();
		} catch (err) {
			console.error(
				'Error deleting project:',
				err,
			);
			alert('Failed to delete project');
		} finally {
			setDeleteLoading(null);
		}
	};

	const handleOpenModal = (project?: WebProject) => {
		if (project) {
			setEditingProject(project);
			setFormData({
				title: project.title,
				product: project.product,
				client: project.client,
				category: project.category,
				image: project.image,
			});
		} else {
			setEditingProject(null);
			setFormData({
				title: '',
				product: '',
				client: '',
				category: '',
				image: '',
			});
		}
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingProject(null);
		setFormData({
			title: '',
			product: '',
			client: '',
			category: '',
			image: '',
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitLoading(true);

		try {
			const token = localStorage.getItem('token');
			const url = editingProject
				? `/api/web-projects/${editingProject._id}`
				: '/api/web-projects';
			const method = editingProject ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to ${editingProject ? 'update' : 'create'} project`,
				);
			}

			fetchProjects();
			handleCloseModal();
		} catch (err) {
			console.error(
				`Error ${editingProject ? 'updating' : 'creating'} project:`,
				err,
			);
			alert(`Failed to ${editingProject ? 'update' : 'create'} project`);
		} finally {
			setSubmitLoading(false);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<MainLayout title="Web Projects">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8 flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Web Projects
						</h2>
						<p className="text-gray-600">
							Kelola project website
						</p>
					</div>
					<button
						onClick={() => handleOpenModal()}
						className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
					>
						+ Tambah Project
					</button>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
						<div className="text-sm text-red-600 font-medium">
							{error}
						</div>
					</div>
				)}

				{/* Projects Grid */}
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
					{loading ? (
						<div className="p-8 text-center">
							<div className="inline-flex items-center space-x-3">
								<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
								<span className="text-gray-600">
									Memuat projects...
								</span>
							</div>
						</div>
					) : projects.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							Tidak ada project yang
							ditemukan
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
							{projects.map((project) => (
								<div
									key={project._id}
									className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
								>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={project.image}
										alt={project.title}
										className="w-full h-48 object-cover"
									/>
									<div className="p-4">
										<div className="flex items-center justify-between mb-2">
											<span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
												{project.category}
											</span>
										</div>
										<h3 className="text-lg font-bold text-gray-900 mb-2">
											{project.title}
										</h3>
										<div className="space-y-1 mb-4">
											<p className="text-sm text-gray-600">
												<span className="font-semibold">Product:</span> {project.product}
											</p>
											<p className="text-sm text-gray-600">
												<span className="font-semibold">Client:</span> {project.client}
											</p>
										</div>
										<div className="flex space-x-2">
											<button
												onClick={() => handleOpenModal(project)}
												className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
											>
												Edit
											</button>
											<button
												onClick={() =>
													handleDelete(
														project._id,
													)
												}
												disabled={
													deleteLoading ===
													project._id
												}
												className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
											>
												{deleteLoading ===
												project._id
													? 'Deleting...'
													: 'Delete'}
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Summary */}
				{!loading &&
					projects.length > 0 && (
						<div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
							<div className="text-sm text-gray-600">
								Total projects:{' '}
								<span className="font-semibold text-gray-900">
									{projects.length}
								</span>
							</div>
						</div>
					)}
			</div>

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<h3 className="text-xl font-bold text-gray-900 mb-4">
								{editingProject ? 'Edit Project' : 'Tambah Project Baru'}
							</h3>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Title
									</label>
									<input
										type="text"
										name="title"
										value={formData.title}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Product
									</label>
									<input
										type="text"
										name="product"
										value={formData.product}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Client
									</label>
									<input
										type="text"
										name="client"
										value={formData.client}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Category
									</label>
									<input
										type="text"
										name="category"
										value={formData.category}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Image URL
									</label>
									<input
										type="text"
										name="image"
										value={formData.image}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
								<div className="flex space-x-3 mt-6">
									<button
										type="button"
										onClick={handleCloseModal}
										className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
									>
										Batal
									</button>
									<button
										type="submit"
										disabled={submitLoading}
										className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-colors font-medium"
									>
										{submitLoading ? 'Menyimpan...' : 'Simpan'}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</MainLayout>
	);
}
