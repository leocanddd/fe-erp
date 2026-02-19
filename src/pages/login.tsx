import { login } from '@/lib/auth';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function AdminLogin() {
	const [credentials, setCredentials] =
		useState({
			username: '',
			password: '',
		});
	const [error, setError] =
		useState('');
	const [isLoading, setIsLoading] =
		useState(false);
	const router = useRouter();

	const handleSubmit = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		try {
			const response = await login(
				credentials,
			);

			if (
				response.statusCode === 200 &&
				response.accessToken
			) {
				router.push('/dashboard');
			} else {
				setError(
					response.error ||
						'Login failed',
				);
			}
		} catch {
			setError(
				'An unexpected error occurred',
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const { name, value } = e.target;
		setCredentials((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="https://assetsdki.my.id/dki-logo.jpeg"
						alt="Logo"
						className="w-8 h-8 rounded-xl object-cover mx-auto mb-4"
					/>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Selamat Datang
					</h1>
					<p className="text-gray-500">
						Masuk ke sistem PT. Duta
						Kencana Indah
					</p>
				</div>

				<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
					<form
						className="space-y-6"
						onSubmit={handleSubmit}
					>
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-semibold text-gray-700 mb-2"
							>
								Nama Pengguna
							</label>
							<input
								id="username"
								name="username"
								type="text"
								autoComplete="username"
								required
								value={
									credentials.username
								}
								onChange={handleChange}
								className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
								placeholder="Masukkan nama pengguna"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-semibold text-gray-700 mb-2"
							>
								Kata Sandi
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								value={
									credentials.password
								}
								onChange={handleChange}
								className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
								placeholder="Masukkan kata sandi"
							/>
						</div>

						{error && (
							<div className="bg-red-50 border border-red-200 rounded-2xl p-4">
								<div className="text-sm text-red-600 font-medium">
									{error}
								</div>
							</div>
						)}

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
						>
							{isLoading ? (
								<div className="flex items-center justify-center">
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
									Sedang masuk...
								</div>
							) : (
								'Masuk'
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
