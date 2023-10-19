import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentUser: null,
  error: null,
  loading: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload
      state.error = null
      state.loading = false
    },
    signInFailure: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    updateUserStart: (state) => {
      state.loading = true
    },
    updateUserSuccess: (state, action) => {
      state.currentUser = action.payload
      state.error = null
      state.loading = false
    },
    updateUserFailure: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    deleteUserStart: (state) => {
      state.loading = true
    },
    deleteUserSuccess: (state, action) => {
      state.currentUser = null
      state.error = null
      state.loading = false
    },
    deleteUserFailure: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    signOutUserStart: (state) => {
      state.loading = true
    },
    signOutUserSuccess: (state, action) => {
      state.currentUser = null
      state.error = null
      state.loading = false
    },
    signOutUserFailure: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  updateUserStart,
  updateUserFailure,
  updateUserSuccess,
  deleteUserStart,
  deleteUserFailure,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} = userSlice.actions

export default userSlice.reducer
