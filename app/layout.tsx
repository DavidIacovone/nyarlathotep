import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';
import { ProModal } from '@/components/pro-modal';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Nyarlathotep',
	description: 'Create your own character',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<html
				lang='en'
				suppressHydrationWarning>
				<body className={inter.className}>
					<ThemeProvider
						attribute='class'
						defaultTheme='system'
						enableSystem>
						<ProModal />
						{children}
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
