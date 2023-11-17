import { Redis } from '@upstash/redis';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from 'langchain/vectorstores/pinecone';

export type CharacterKey = {
	characterName: string;
	modelName: string;
	userId: string;
};

export class MemoryManager {
	private static instance: MemoryManager;
	private history: Redis;
	private vectorDBClient: PineconeClient;

	public constructor() {
		this.history = Redis.fromEnv();
		this.vectorDBClient = new PineconeClient();
	}

	public async init() {
		if (this.vectorDBClient instanceof PineconeClient) {
			await new PineconeClient({
				apiKey: process.env.PINECONE_API_KEY!,
				environment: process.env.PINECONE_ENVIRONMENT!,
			});
		}
	}

	public async vectorSearch(recentChatHistory: string, CharacterFileName: string) {
		const pineconeClient = <PineconeClient>this.vectorDBClient;

		const pineconeIndex = pineconeClient.Index(
			process.env.PINECONE_INDEX! || ''
		);

		const vectorStore = await PineconeStore.fromExistingIndex(
			new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
			{ pineconeIndex }
		);

		const similarDocs = await vectorStore
			.similaritySearch(recentChatHistory, 3, { fileName: CharacterFileName })
			.catch((err) => {
				console.log('WARNING: failed to get vector search results.', err);
			});
		return similarDocs;
	}

	public static async getInstance(): Promise<MemoryManager> {
		if (!MemoryManager.instance) {
			MemoryManager.instance = new MemoryManager();
			await MemoryManager.instance.init();
		}
		return MemoryManager.instance;
	}

	private generateRedisCharacterKey(CharacterKey: CharacterKey): string {
		return `${CharacterKey.characterName}-${CharacterKey.modelName}-${CharacterKey.userId}`;
	}

	public async writeToHistory(text: string, CharacterKey: CharacterKey) {
		if (!CharacterKey || typeof CharacterKey.userId == 'undefined') {
			console.log('Character key set incorrectly');
			return '';
		}

		const key = this.generateRedisCharacterKey(CharacterKey);
		const result = await this.history.zadd(key, {
			score: Date.now(),
			member: text,
		});

		return result;
	}

	public async readLatestHistory(CharacterKey: CharacterKey): Promise<string> {
		if (!CharacterKey || typeof CharacterKey.userId == 'undefined') {
			console.log('Character key set incorrectly');
			return '';
		}

		const key = this.generateRedisCharacterKey(CharacterKey);
		let result = await this.history.zrange(key, 0, Date.now(), {
			byScore: true,
		});

		result = result.slice(-30).reverse();
		const recentChats = result.reverse().join('\n');
		return recentChats;
	}

	public async seedChatHistory(
		seedContent: String,
		delimiter: string = '\n',
		CharacterKey: CharacterKey
	) {
		const key = this.generateRedisCharacterKey(CharacterKey);
		if (await this.history.exists(key)) {
			console.log('User already has chat history');
			return;
		}

		const content = seedContent.split(delimiter);
		let counter = 0;
		for (const line of content) {
			await this.history.zadd(key, { score: counter, member: line });
			counter += 1;
		}
	}
}
