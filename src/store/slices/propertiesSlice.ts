import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface PropertyItem {
  id: string;
  ownerName: string;
  address: string;
  phone?: string | null;
  latitude: number;
  longitude: number;
  propertyTypeId: string;
  propertyType?: {
    id: string;
    name: string;
    activePrice?: number;
    activeUnit?: string;
  };
  _count?: { collections: number };
}

interface PropertiesState {
  items: PropertyItem[];
  loading: boolean;
  error: string | null;
  selectedPropertyId: string | null;
}

const initialState: PropertiesState = {
  items: [],
  loading: false,
  error: null,
  selectedPropertyId: null,
};

export const fetchProperties = createAsyncThunk('properties/fetchProperties', async () => {
  const res = await fetch('/api/admin/properties');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch properties');
  return data.properties as PropertyItem[];
});

export const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setSelectedProperty: (state, action: PayloadAction<string | null>) => {
      state.selectedPropertyId = action.payload;
    },
    addProperty: (state, action: PayloadAction<PropertyItem>) => {
      state.items.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load properties';
      });
  },
});

export const { setSelectedProperty, addProperty } = propertiesSlice.actions;
export default propertiesSlice.reducer;
