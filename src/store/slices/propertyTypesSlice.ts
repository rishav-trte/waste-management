import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface PropertyTypeItem {
  id: string;
  name: string;
  description?: string | null;
  activePrice?: number;
  activeUnit?: string;
  _count?: { properties: number; pricingConfigs: number };
}

interface PropertyTypesState {
  items: PropertyTypeItem[];
  loading: boolean;
  error: string | null;
}

const initialState: PropertyTypesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchPropertyTypes = createAsyncThunk('propertyTypes/fetchPropertyTypes', async () => {
  const res = await fetch('/api/admin/property-types');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch property types');
  return data.propertyTypes as PropertyTypeItem[];
});

export const propertyTypesSlice = createSlice({
  name: 'propertyTypes',
  initialState,
  reducers: {
    updatePropertyTypeInState: (state, action: PayloadAction<PropertyTypeItem>) => {
      const idx = state.items.findIndex((item) => item.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      } else {
        state.items.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPropertyTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPropertyTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load property types';
      });
  },
});

export const { updatePropertyTypeInState } = propertyTypesSlice.actions;
export default propertyTypesSlice.reducer;
