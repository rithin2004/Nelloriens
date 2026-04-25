import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

export const submitContactForm = createAsyncThunk(
    "contact/submitContactForm",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post("/leads/submit", formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to send message. Please try again.");
        }
    }
);

const initialState = {
    loading: false,
    success: false,
    error: null,
    submittedData: null,
};

const contactSlice = createSlice({
    name: "contact",
    initialState,
    reducers: {
        resetContactForm: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
            state.submittedData = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitContactForm.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(submitContactForm.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.submittedData = action.payload;
            })
            .addCase(submitContactForm.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetContactForm } = contactSlice.actions;
export default contactSlice.reducer;
