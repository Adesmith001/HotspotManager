import {configureStore} from '@reduxjs/toolkit';

import hotspotReducer from './slices/hotspotSlice';
import subscriptionReducer from './slices/subscriptionSlice';

export const store = configureStore({
  reducer: {
    hotspot: hotspotReducer,
    subscription: subscriptionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
