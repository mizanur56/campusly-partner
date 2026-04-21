/** After register + setUser, GuestOnlyAuthRoute redirects here before home. */
export const POST_REGISTER_WELCOME_FLAG = "ct_post_register_welcome";
export const REGISTRATION_WELCOME_NAME_KEY = "ct_registration_welcome_name";

export function setPostRegistrationWelcomeSession(contactPersonName: string) {
  sessionStorage.setItem(POST_REGISTER_WELCOME_FLAG, "1");
  sessionStorage.setItem(REGISTRATION_WELCOME_NAME_KEY, contactPersonName);
}
