import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import confirmationReducer from "./slices/confirmationSlice";
import actionSheetReducer from "./slices/actionSheetSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    confirmation: confirmationReducer,
    actionSheet: actionSheetReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
