import { Categories } from '@/components/categories';
import { Characters } from '@/components/characters';
import { SearchInput } from '@/components/search-input';
import prismadb from '@/lib/prismadb';

interface MainPageProps {
	searchParams: {
		categoryId: string;
		name: string;
	};
}

const MainPage = async ({ searchParams }: MainPageProps) => {
	const data = await prismadb.character.findMany({
		where: {
			categoryId: searchParams.categoryId,
			name: {
				search: searchParams.name,
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
		include: {
			_count: {
				select: {
					messages: true,
				},
			},
		},
	});
	const categories = await prismadb.category.findMany();

	return (
		<div className='h-full p-4 space-y-2'>
			<SearchInput />
			<Categories data={categories} />
			<Characters data={data} />
		</div>
	);
};

export default MainPage;
