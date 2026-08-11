import { configureStore } from '@reduxjs/toolkit';
import propertiesReducer from './slices/propertiesSlice';
import propertyTypesReducer from './slices/propertyTypesSlice';
import wasteRequestsReducer from './slices/wasteRequestsSlice';

export const store = configureStore({
  reducer: {
    properties: propertiesReducer,
    propertyTypes: propertyTypesReducer,
    wasteRequests: wasteRequestsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
