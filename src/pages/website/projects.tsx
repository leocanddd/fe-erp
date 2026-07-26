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
			<style jsx>{`
				.welcome {
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-bottom: 24px;
				}
				.welcome h1 {
					margin: 0;
					font-weight: 800;
					font-size: 24px;
					color: var(--dark);
				}
				.date {
					font-size: 13px;
					color: var(--muted);
					margin-top: 4px;
				}
				.sub-actions {
					margin-left: auto;
				}
				.btn {
					display: inline-flex;
					align-items: center;
					gap: 8px;
					height: 38px;
					padding: 0 18px;
					border: none;
					border-radius: 9px;
					cursor: pointer;
					font-family: 'Montserrat', sans-serif;
					font-weight: 700;
					font-size: 13px;
					color: #fff;
					background: linear-gradient(135deg, #1ca7ec 0%, #121567 100%);
					transition: 0.18s;
					white-space: nowrap;
				}
				.btn:hover {
					filter: brightness(1.07);
					transform: translateY(-1px);
				}
				.vcard {
					background: var(--card);
					border: 1px solid var(--border);
					border-radius: 12px;
					padding: 24px 28px;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
				}
				.pgrid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
					gap: 18px;
				}
				.pcard {
					border: 1px solid var(--border);
					border-radius: 12px;
					overflow: hidden;
					background: #fff;
					transition: 0.18s;
					cursor: pointer;
				}
				.pcard:hover {
					box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
					transform: translateY(-2px);
				}
				.pcover {
					height: 140px;
					background-size: cover;
					background-position: center;
					display: flex;
					align-items: center;
					justify-content: center;
					color: #9fb4c8;
					position: relative;
				}
				.pcover.empty {
					background: linear-gradient(135deg, #e8f1f9, #d6e6f2);
				}
				.pcover svg {
					width: 34px;
					height: 34px;
					stroke-width: 1.6;
				}
				.pc-badge {
					position: absolute;
					top: 10px;
					left: 10px;
				}
				.chip {
					display: inline-flex;
					align-items: center;
					gap: 6px;
					font-weight: 700;
					font-size: 11px;
					padding: 4px 11px;
					border-radius: 100px;
					white-space: nowrap;
				}
				.chip.green {
					background: #e7f7ee;
					color: #1f8a4d;
				}
				.chip .cdot {
					width: 6px;
					height: 6px;
					border-radius: 50%;
					background: currentColor;
				}
				.pcard-body {
					padding: 15px 16px;
				}
				.pcard-cat {
					font-weight: 600;
					font-size: 11px;
					text-transform: uppercase;
					letter-spacing: 0.04em;
					color: var(--blue);
					margin-bottom: 6px;
				}
				.pcard-title {
					font-weight: 700;
					font-size: 15px;
					color: var(--dark);
					line-height: 1.35;
					margin-bottom: 6px;
				}
				.pcard-sub {
					font-weight: 400;
					font-size: 12.5px;
					color: var(--muted);
					line-height: 1.5;
					margin-bottom: 12px;
				}
				.pcard-foot {
					display: flex;
					align-items: center;
					justify-content: flex-end;
					font-size: 12px;
					color: var(--muted);
					gap: 6px;
				}
				.btn.ghost {
					background: #fff;
					border: 1px solid var(--border);
					color: var(--text);
				}
				.btn.ghost:hover {
					border-color: var(--blue);
					color: var(--blue);
					transform: none;
					filter: none;
				}
				.btn.sm {
					height: 32px;
					padding: 0 13px;
					font-size: 12px;
					border-radius: 8px;
				}
				.btn.red {
					background: #fe2c23;
				}
				.btn.red:hover {
					background: #e02419;
				}
				.empty {
					text-align: center;
					color: var(--muted);
					padding: 48px 20px;
				}
				.empty .et {
					font-weight: 700;
					font-size: 15px;
					color: var(--text);
					margin-bottom: 4px;
				}
			`}</style>

			<div className="welcome">
				<div>
					<h1>Portfolio</h1>
					<div className="date">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
				</div>
				<div className="sub-actions">
					<button className="btn" onClick={() => handleOpenModal()}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
							<path d="M12 5v14M5 12h14"/>
						</svg>
						Tambah Proyek
					</button>
				</div>
			</div>

			{error && (
				<div style={{ marginBottom: '16px', background: '#fdecea', border: '1px solid #f5c6cb', borderRadius: '12px', padding: '16px' }}>
					<div style={{ fontSize: '13px', color: '#d93a2f', fontWeight: 600 }}>
						{error}
					</div>
				</div>
			)}

			<section className="vcard">
				{loading ? (
					<div className="empty">
						<div className="et">Memuat projects...</div>
					</div>
				) : projects.length === 0 ? (
					<div className="empty">
						<div className="et">Tidak ada project yang ditemukan</div>
					</div>
				) : (
					<div className="pgrid">
						{projects.map((project) => (
							<div key={project._id} className="pcard">
								<div
									className={`pcover ${!project.image ? 'empty' : ''}`}
									style={project.image ? { backgroundImage: `url(${project.image})` } : {}}
								>
									{!project.image && (
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path d="M3 21h18M5 21V8l9-3v16M14 21V10l5 2v9"/>
										</svg>
									)}
									<span className="pc-badge chip green">
										<span className="cdot"></span>
										Published
									</span>
								</div>
								<div className="pcard-body">
									<div className="pcard-cat">{project.category}</div>
									<div className="pcard-title">{project.title}</div>
									<div className="pcard-sub">{project.product}</div>
									<div className="pcard-sub">{project.client}</div>
									<div className="pcard-foot">
										<button
											className="btn ghost sm"
											onClick={() => handleOpenModal(project)}
										>
											Edit
										</button>
										<button
											className="btn red sm"
											onClick={() => handleDelete(project._id)}
											disabled={deleteLoading === project._id}
										>
											{deleteLoading === project._id ? 'Deleting...' : 'Delete'}
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</section>

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
