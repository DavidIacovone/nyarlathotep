'use client';

import { useCompletion } from 'ai/react';
import { FormEvent, useState } from 'react';
import { Character, Message } from '@prisma/client';
import { useRouter } from 'next/navigation';

import { ChatForm } from '@/components/chat-form';
import { ChatHeader } from '@/components/chat-header';
import { ChatMessages } from '@/components/chat-messages';
import { ChatMessageProps } from '@/components/chat-message';

interface ChatClientProps {
	Character: Character & {
		messages: Message[];
		_count: {
			messages: number;
		};
	};
}

export const ChatClient = ({ Character }: ChatClientProps) => {
	const router = useRouter();
	const [messages, setMessages] = useState<ChatMessageProps[]>(Character.messages);

	const { input, isLoading, handleInputChange, handleSubmit, setInput } =
		useCompletion({
			api: `/api/chat/${Character.id}`,
			onFinish(_prompt, completion) {
				const systemMessage: ChatMessageProps = {
					role: 'system',
					content: completion,
				};

				setMessages((current) => [...current, systemMessage]);
				setInput('');

				router.refresh();
			},
		});

	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		const userMessage: ChatMessageProps = {
			role: 'user',
			content: input,
		};

		setMessages((current) => [...current, userMessage]);

		handleSubmit(e);
	};

	return (
		<div className='flex flex-col h-full p-4 space-y-2'>
			<ChatHeader Character={Character} />
			<ChatMessages
				Character={Character}
				isLoading={isLoading}
				messages={messages}
			/>
			<ChatForm
				isLoading={isLoading}
				input={input}
				handleInputChange={handleInputChange}
				onSubmit={onSubmit}
			/>
		</div>
	);
};
