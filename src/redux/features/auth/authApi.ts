import { baseApi } from "../../api/baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/login",
        method: "POST",
        body: userInfo,
      }),
    }),

    forgotPassword: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: userInfo,
      }),
    }),
    resetPassword: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: userInfo,
      }),
    }),
    changePassword: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/change-password",
        method: "POST",
        body: userInfo,
      }),
    }),
    setPasswordByInvitation: builder.mutation({
      query: (body: { token: string; newPassword: string; confirmPassword: string }) => ({
        url: "/auth/set-password-by-invitation",
        method: "POST",
        body,
      }),
    }),
    register: builder.mutation({
      query: (partnerInfo) => ({
        url: "/auth/register",
        method: "POST",
        body: partnerInfo,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useSetPasswordByInvitationMutation,
  useRegisterMutation,
} = authApi;
