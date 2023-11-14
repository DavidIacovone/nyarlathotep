import prismadb from '@/lib/prismadb';

interface CharacterIdPageProps {
	params: {
		characterId: string;
	};
}

const CharacterIdPage = async ({ params }: CharacterIdPageProps) => {
	const character = await prismadb.character.findUnique({
		where: {
			id: params.characterId,
		},
	});

	const categories = await prismadb.category.findMany();

	return <div>Hello Character ID</div>;
};

export default CharacterIdPage;
