import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConfirmationState {
  visible: boolean;
  title: string;
  message: string;
  cancelLabel?: string;
  confirmLabel?: string;
}

const initialState: ConfirmationState = {
  visible: false,
  title: "",
  message: "",
  cancelLabel: "Cancel",
  confirmLabel: "OK",
};

const confirmationSlice = createSlice({
  name: "confirmation",
  initialState,
  reducers: {
    setConfirmation: (
      state,
      action: PayloadAction<{
        title: string;
        message: string;
        cancelLabel?: string;
        confirmLabel?: string;
      }>,
    ) => {
      state.visible = true;
      state.title = action.payload.title;
      state.message = action.payload.message;
      state.cancelLabel = action.payload.cancelLabel ?? "Cancel";
      state.confirmLabel = action.payload.confirmLabel ?? "OK";
    },
    clearConfirmation: (state) => {
      state.visible = false;
    },
  },
});

export const { setConfirmation, clearConfirmation } = confirmationSlice.actions;
export default confirmationSlice.reducer;
