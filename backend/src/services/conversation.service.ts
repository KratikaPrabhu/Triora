import conversationEngine, { ConversationEngineOutput } from './gemini/conversationEngine';
import sessionService from './session.service';
import { AnswerStatus, ISessionMessage, IVoiceMetrics } from '../types';

export interface ProcessMessageInput {
  userId: string;
  sessionId: string;
  userMessage: string;
  status?: AnswerStatus | 'completed';
  voiceMetrics?: IVoiceMetrics;
}

export class ConversationService {
  /**
   * Process user intake message in session and append AI reply to transcript
   */
  async processSessionMessage(input: ProcessMessageInput): Promise<{
    session: any;
    aiResponse: ConversationEngineOutput;
  }> {
    const { userId, sessionId, userMessage, status = 'answered', voiceMetrics } = input;

    // 1. Retrieve session and verify ownership
    let session = await sessionService.getSessionById(userId, sessionId);

    // 2. Persist patient response to session transcript FIRST
    
    if (status === 'completed') {
      const updatedSession = await sessionService.updateSession(userId, sessionId, {
        status: 'completed'
      });
      return {
        session: updatedSession,
        aiResponse: {
          action: 'complete',
          reply: '',
          metadata: {
            intent: 'Session manually completed',
            topic: 'N/A',
            shouldContinue: false,
            totalQuestions: session.transcript?.length || 0,
            sessionEnded: true
          }
        }
      };
    }

    const userTranscriptItems: ISessionMessage[] = [];
    if (status === 'answered' && userMessage.trim()) {
      userTranscriptItems.push({
        role: 'user',
        text: userMessage.trim(),
        status: 'answered',
        timestamp: new Date(),
        ...(voiceMetrics ? { voiceMetrics } : {})
      });
    } else if (status === 'skipped') {
      userTranscriptItems.push({
        role: 'user',
        text: '',
        status: 'skipped',
        timestamp: new Date(),
        ...(voiceMetrics ? { voiceMetrics } : {})
      });
    }

    if (userTranscriptItems.length > 0) {
      session = await sessionService.updateSession(userId, sessionId, {
        status: session.status === 'created' ? 'active' : session.status,
        transcript: userTranscriptItems
      });
    }

    // 3. Call Conversation Engine with complete updated history
    const aiResponse = await conversationEngine.processConversation({
      sessionId,
      language: session.language || 'English',
      history: session.transcript || [],
      latestMessage: status === 'answered' ? userMessage.trim() : ''
    });

    const aiTranscriptItems: ISessionMessage[] = [];

    // 4. Save AI assistant reply if question is asked
    if (aiResponse.action === 'ask' && aiResponse.reply.trim()) {
      aiTranscriptItems.push({
        role: 'assistant',
        text: aiResponse.reply.trim(),
        timestamp: new Date()
      });
    }

    // 5. Update session status and append assistant response to transcript
    const newStatus = aiResponse.action === 'complete' ? 'completed' : (session.status === 'created' ? 'active' : session.status);

    const updatedSession = await sessionService.updateSession(userId, sessionId, {
      status: newStatus,
      transcript: aiTranscriptItems,
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
