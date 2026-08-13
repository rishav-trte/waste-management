import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface WasteRequestItem {
  id: string;
  userId: string;
  address: string;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  wasteType: string;
  preferredDate: string;
  status: string;
  notes?: string | null;
  propertyType?: { name: string };
  user?: { name: string; email: string };
}

interface WasteRequestsState {
  items: WasteRequestItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WasteRequestsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchWasteRequests = createAsyncThunk('wasteRequests/fetchWasteRequests', async () => {
  const res = await fetch('/api/portal/waste-requests');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch waste requests');
  return data.requests as WasteRequestItem[];
});

export const wasteRequestsSlice = createSlice({
  name: 'wasteRequests',
  initialState,
  reducers: {
    addWasteRequest: (state, action: PayloadAction<WasteRequestItem>) => {
      state.items.unshift(action.payload);
    },
    updateWasteRequestStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const target = state.items.find((r) => r.id === action.payload.id);
      if (target) target.status = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWasteRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWasteRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWasteRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load waste requests';
      });
  },
});

export const { addWasteRequest, updateWasteRequestStatus } = wasteRequestsSlice.actions;
export default wasteRequestsSlice.reducer;
