import conversationEngine, { ConversationEngineOutput } from './gemini/conversationEngine';
import sessionService from './session.service';

export interface ProcessMessageInput {
  userId: string;
  sessionId: string;
  userMessage: string;
}

export class ConversationService {
  /**
   * Process user intake message in session and append AI reply to transcript
   */
  async processSessionMessage(input: ProcessMessageInput): Promise<{
    session: any;
    aiResponse: ConversationEngineOutput;
  }> {
    const { userId, sessionId, userMessage } = input;

    // Retrieve session and verify ownership
    const session = await sessionService.getSessionById(userId, sessionId);

    // Call Conversation Engine
    const aiResponse = await conversationEngine.processConversation({
      sessionId,
      language: session.language || 'English',
      history: session.transcript || [],
      latestMessage: userMessage
    });

    // Update session transcript and metadata
    const updatedSession = await sessionService.updateSession(userId, sessionId, {
      status: session.status === 'created' ? 'active' : session.status,
      transcript: [
        { role: 'user', text: userMessage.trim(), timestamp: new Date() },
        { role: 'assistant', text: aiResponse.reply, timestamp: new Date() }
      ],
      metadata: {
        lastIntent: aiResponse.metadata.intent,
        lastTopic: aiResponse.metadata.topic
      }
    });

    return {
      session: updatedSession,
      aiResponse
    };
  }
}

export default new ConversationService();
