import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ActionSheetOption {
  label: string;
  icon: string;
  variant?: "default" | "danger";
}

interface ActionSheetState {
  visible: boolean;
  title: string;
  options: ActionSheetOption[];
}

const initialState: ActionSheetState = {
  visible: false,
  title: "",
  options: [],
};

const actionSheetSlice = createSlice({
  name: "actionSheet",
  initialState,
  reducers: {
    setActionSheet: (
      state,
      action: PayloadAction<{ title: string; options: ActionSheetOption[] }>,
    ) => {
      state.visible = true;
      state.title = action.payload.title;
      state.options = action.payload.options;
    },
    clearActionSheet: (state) => {
      state.visible = false;
    },
  },
});

export const { setActionSheet, clearActionSheet } = actionSheetSlice.actions;
export default actionSheetSlice.reducer;
