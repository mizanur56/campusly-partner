const SocialLoginButtons = () => {
  return (
    <div className="pt-3">
      <div className="flex justify-center gap-3 sm:gap-4">
        <button
          type="button"
          className="w-11 h-11 cursor-pointer rounded-full bg-white border border-primary-border shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-center hover:bg-neutral-50 transition-colors"
          aria-label="Login with Google"
        >
          <img
            src="/assets/auth/icons/devicon_google.svg"
            alt="Google"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </button>
        <button
          type="button"
          className="w-11 h-11 cursor-pointer rounded-full bg-white border border-primary-border shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-center hover:bg-neutral-50 transition-colors"
          aria-label="Login with Facebook"
        >
          <img
            src="/assets/auth/icons/logos_facebook.svg"
            alt="Facebook"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </button>
      </div>
    </div>
  );
};

export default SocialLoginButtons;
