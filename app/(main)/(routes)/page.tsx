import { UserButton } from '@clerk/nextjs';

const MainPage = () => {
	return (
		<div>
			<UserButton afterSignOutUrl='/' />
		</div>
	);
};

export default MainPage;
