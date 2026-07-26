import { login } from '@/lib/auth';
import Head from 'next/head';
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
	const [mode, setMode] = useState<
		'desktop' | 'mobile'
	>('desktop');
	const router = useRouter();

	const handleSubmit = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		if (
			!credentials.username.trim() ||
			!credentials.password
		) {
			setError(
				'Harap isi semua kolom.',
			);
			setIsLoading(false);
			return;
		}

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
						'Nama pengguna atau kata sandi salah.',
				);
			}
		} catch {
			setError(
				'Nama pengguna atau kata sandi salah.',
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
		setError('');
	};

	return (
		<>
			<Head>
				<title>DKI ERP — Masuk</title>
				<link
					rel="preconnect"
					href="https://fonts.googleapis.com"
				/>
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700;800&display=swap"
					rel="stylesheet"
				/>
			</Head>
			<div
				className="min-h-screen flex items-center justify-center relative overflow-hidden"
				style={{
					fontFamily:
						"'Montserrat', sans-serif",
					background: '#f0f2f8',
					WebkitFontSmoothing:
						'antialiased',
				}}
			>
				{/* Radial glow background */}
				<div
					className="fixed inset-0 pointer-events-none"
					style={{
						background:
							'radial-gradient(ellipse 800px 600px at center, rgba(28, 167, 236, 0.06) 0%, transparent 70%)',
					}}
				/>

				<div className="relative z-10 flex flex-col items-center w-[600px] max-w-[calc(100vw-48px)]">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="https://assetsdki.my.id/Logo_DKI.png"
						alt="PT Duta Kencana Indah"
						className="h-16 w-auto block"
					/>
					<h1
						className="font-extrabold text-[40px] leading-tight text-center mt-5"
						style={{ color: '#121567' }}
					>
						Selamat Datang
					</h1>
					<p
						className="font-normal text-base text-center mt-2"
						style={{ color: '#9a9a9a' }}
					>
						Masuk ke sistem PT. Duta
						Kencana Indah
					</p>

					<div
						className="bg-white rounded-[20px] w-[600px] max-w-[calc(100vw-48px)] mt-10 p-10 md:p-12"
						style={{
							boxShadow:
								'0 8px 40px rgba(0, 0, 0, 0.08)',
						}}
					>
						<form
							onSubmit={handleSubmit}
							autoComplete="off"
						>
							<div className="mb-6">
								<label
									htmlFor="username"
									className="block font-bold text-[15px] mb-2.5"
									style={{
										color: '#121567',
									}}
								>
									Nama Pengguna
								</label>
								<input
									id="username"
									name="username"
									type="text"
									value={
										credentials.username
									}
									onChange={
										handleChange
									}
									placeholder="Masukkan nama pengguna"
									className="w-full h-14 rounded-xl px-5 border-0 font-normal text-[15px] transition-all duration-200"
									style={{
										background:
											'#f4f6f9',
										color: '#111111',
										fontFamily:
											"'Montserrat', sans-serif",
									}}
									onFocus={(e) => {
										e.target.style.background =
											'#ebf6fd';
										e.target.style.boxShadow =
											'0 0 0 2px #1ca7ec';
									}}
									onBlur={(e) => {
										e.target.style.background =
											'#f4f6f9';
										e.target.style.boxShadow =
											'none';
									}}
								/>
							</div>

							<div className="mb-6">
								<label
									htmlFor="password"
									className="block font-bold text-[15px] mb-2.5"
									style={{
										color: '#121567',
									}}
								>
									Kata Sandi
								</label>
								<input
									id="password"
									name="password"
									type="password"
									value={
										credentials.password
									}
									onChange={
										handleChange
									}
									placeholder="Masukkan kata sandi"
									className="w-full h-14 rounded-xl px-5 border-0 font-normal text-[15px] transition-all duration-200"
									style={{
										background:
											'#f4f6f9',
										color: '#111111',
										fontFamily:
											"'Montserrat', sans-serif",
									}}
									onFocus={(e) => {
										e.target.style.background =
											'#ebf6fd';
										e.target.style.boxShadow =
											'0 0 0 2px #1ca7ec';
									}}
									onBlur={(e) => {
										e.target.style.background =
											'#f4f6f9';
										e.target.style.boxShadow =
											'none';
									}}
								/>
							</div>

							<div className="min-h-[21px] mt-2">
								{error && (
									<div className="text-[#fe2c23] font-medium text-[13px]">
										{error}
									</div>
								)}
							</div>

							{/* Desktop / Mobile Mode Toggle */}
							<div
								className="flex gap-1.5 rounded-[14px] p-1.5 mt-7"
								style={{
									background: '#f4f6f9',
								}}
							>
								<button
									type="button"
									onClick={() =>
										setMode('desktop')
									}
									className={`flex-1 h-12 rounded-[10px] border-0 cursor-pointer font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 ${
										mode === 'desktop'
											? 'bg-white text-[#121567]'
											: 'bg-transparent text-[#9a9a9a]'
									}`}
									style={{
										fontFamily:
											"'Montserrat', sans-serif",
										boxShadow:
											mode === 'desktop'
												? '0 2px 8px rgba(18, 21, 103, 0.12)'
												: 'none',
									}}
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="w-[18px] h-[18px]"
										style={{
											color:
												mode ===
												'desktop'
													? '#1ca7ec'
													: 'currentColor',
										}}
									>
										<rect
											x="2"
											y="3"
											width="20"
											height="14"
											rx="2"
										/>
										<path d="M8 21h8M12 17v4" />
									</svg>
									Desktop
								</button>
								<button
									type="button"
									onClick={() =>
										setMode('mobile')
									}
									className={`flex-1 h-12 rounded-[10px] border-0 cursor-pointer font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 ${
										mode === 'mobile'
											? 'bg-white text-[#121567]'
											: 'bg-transparent text-[#9a9a9a]'
									}`}
									style={{
										fontFamily:
											"'Montserrat', sans-serif",
										boxShadow:
											mode === 'mobile'
												? '0 2px 8px rgba(18, 21, 103, 0.12)'
												: 'none',
									}}
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="w-[18px] h-[18px]"
										style={{
											color:
												mode ===
												'mobile'
													? '#1ca7ec'
													: 'currentColor',
										}}
									>
										<rect
											x="6"
											y="2"
											width="12"
											height="20"
											rx="3"
										/>
										<path d="M11 18h2" />
									</svg>
									Mobile
								</button>
							</div>

							<button
								type="submit"
								disabled={isLoading}
								className={`w-full h-14 rounded-[14px] border-0 cursor-pointer mt-8 text-white font-extrabold text-[17px] tracking-wide transition-all duration-200 ${
									isLoading
										? 'opacity-70'
										: ''
								}`}
								style={{
									background:
										'linear-gradient(90deg, #61bedf 0%, #1ca7ec 50%, #1590cd 100%)',
									fontFamily:
										"'Montserrat', sans-serif",
									filter: isLoading
										? 'none'
										: undefined,
								}}
								onMouseEnter={(e) => {
									if (!isLoading) {
										e.currentTarget.style.filter =
											'brightness(1.08)';
										e.currentTarget.style.transform =
											'translateY(-1px)';
										e.currentTarget.style.boxShadow =
											'0 6px 20px rgba(28, 167, 236, 0.35)';
									}
								}}
								onMouseLeave={(e) => {
									if (!isLoading) {
										e.currentTarget.style.filter =
											'brightness(1)';
										e.currentTarget.style.transform =
											'translateY(0)';
										e.currentTarget.style.boxShadow =
											'none';
									}
								}}
								onMouseDown={(e) => {
									if (!isLoading) {
										e.currentTarget.style.transform =
											'translateY(0)';
										e.currentTarget.style.filter =
											'brightness(0.97)';
									}
								}}
								onMouseUp={(e) => {
									if (!isLoading) {
										e.currentTarget.style.filter =
											'brightness(1.08)';
									}
								}}
							>
								{isLoading
									? 'Memuat...'
									: 'Masuk'}
							</button>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}
