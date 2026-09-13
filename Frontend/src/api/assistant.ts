import { api } from './client'
import type { AssistantChatResponse, AssistantMessage } from '@/types/api'

/**
 * The assistant endpoints.
 *
 * Neither takes an employee id: the server reads the caller from the token, so there is no way
 * to ask about somebody else. History travels with each question because the server keeps no
 * conversation state.
 */
export const assistantApi = {
  chat: (message: string, history: AssistantMessage[], signal?: AbortSignal) =>
    api.post<AssistantChatResponse>('/api/assistant/chat', { message, history }, signal),

  suggestions: (signal?: AbortSignal) =>
    api.get<string[]>('/api/assistant/suggestions', signal),
}
