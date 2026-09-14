import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Session, TranscriptMessage } from '../types';
import sessionService from '../services/session.service';

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
  wsStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  transcript: TranscriptMessage[];
  isAiProcessing: boolean;
}

const initialState: SessionState = {
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
  wsStatus: 'disconnected',
  transcript: [],
  isAiProcessing: false,
};

export const fetchSessions = createAsyncThunk('session/fetchSessions', async (_, { rejectWithValue }) => {
  try {
    const sessions = await sessionService.getSessions();
    return sessions;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch sessions');
  }
});

export const createNewSession = createAsyncThunk('session/createNewSession', async (language: string | undefined, { rejectWithValue }) => {
  try {
    const session = await sessionService.createSession(language);
    return session;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to create intake session');
  }
});

export const fetchSessionById = createAsyncThunk('session/fetchSessionById', async (id: string, { rejectWithValue }) => {
  try {
    const session = await sessionService.getSessionById(id);
    return session;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch session details');
  }
});

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setWsStatus(state, action: PayloadAction<'disconnected' | 'connecting' | 'connected' | 'error'>) {
      state.wsStatus = action.payload;
    },
    setAiProcessing(state, action: PayloadAction<boolean>) {
      state.isAiProcessing = action.payload;
    },
    addTranscriptMessage(state, action: PayloadAction<TranscriptMessage>) {
      const msg = action.payload;
      const isDuplicate = state.transcript.some((existing) => {
        if (existing.role !== msg.role || existing.text.trim() !== msg.text.trim()) {
          return false;
        }
        if (existing.id && msg.id) {
          return existing.id === msg.id;
        }
        const existingTime = existing.timestamp ? new Date(existing.timestamp).getTime() : 0;
        const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0;
        return Math.abs(existingTime - msgTime) < 1000;
      });
      if (!isDuplicate) {
        state.transcript.push(msg);
        if (state.currentSession) {
          state.currentSession.transcript = [...state.transcript];
        }
      }
    },
    setTranscript(state, action: PayloadAction<TranscriptMessage[]>) {
      state.transcript = action.payload;
    },
    clearCurrentSession(state) {
      state.currentSession = null;
      state.transcript = [];
      state.wsStatus = 'disconnected';
      state.isAiProcessing = false;
    },
    updateCurrentSessionStatus(state, action: PayloadAction<'created' | 'active' | 'completed' | 'failed'>) {
      if (state.currentSession) {
        state.currentSession.status = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSessions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSessions.fulfilled, (state, action: PayloadAction<Session[]>) => {
      state.loading = false;
      state.sessions = action.payload;
    });
    builder.addCase(fetchSessions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createNewSession.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createNewSession.fulfilled, (state, action: PayloadAction<Session>) => {
      state.loading = false;
      state.currentSession = action.payload;
      state.transcript = action.payload.transcript || [];
    });
    builder.addCase(createNewSession.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchSessionById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSessionById.fulfilled, (state, action: PayloadAction<Session>) => {
      state.loading = false;
      state.currentSession = action.payload;
      state.transcript = action.payload.transcript || [];
    });
    builder.addCase(fetchSessionById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setWsStatus,
  setAiProcessing,
  addTranscriptMessage,
  setTranscript,
  clearCurrentSession,
  updateCurrentSessionStatus,
} = sessionSlice.actions;

export default sessionSlice.reducer;
