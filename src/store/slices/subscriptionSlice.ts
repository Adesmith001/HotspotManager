import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface SubscriptionState {
  active: boolean;
  source: 'cache' | 'revenuecat';
  expiresAt: string | null;
  lastValidatedAt: number | null;
}

const initialState: SubscriptionState = {
  active: false,
  source: 'cache',
  expiresAt: null,
  lastValidatedAt: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setPremiumStatus: (
      state,
      action: PayloadAction<{active: boolean; source: 'cache' | 'revenuecat'}>,
    ) => {
      state.active = action.payload.active;
      state.source = action.payload.source;
    },
    setSubscriptionMetadata: (
      state,
      action: PayloadAction<{expiresAt: string | null; lastValidatedAt: number}>,
    ) => {
      state.expiresAt = action.payload.expiresAt;
      state.lastValidatedAt = action.payload.lastValidatedAt;
    },
  },
});

export const {setPremiumStatus, setSubscriptionMetadata} =
  subscriptionSlice.actions;
export default subscriptionSlice.reducer;
