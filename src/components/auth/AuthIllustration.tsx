const AuthIllustration = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col relative lg:min-h-[520px] pt-6 pb-10">
      {/* Main illustration - centered above the splash */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <img
          src={encodeURI("/ChatGPT Image Jun 25, 2025, 05_09_37 PM 1.png")}
          alt="Authentication illustration"
          className="w-full h-auto max-w-[100%]"
          style={{ maxWidth: "min(100%, 500px)" }}
        />
      </div>
      {/* Bottom green splash - Group 26.png, slightly above bottom */}
      <div className="absolute bottom-20 sm:bottom-24 left-0 right-0 z-[1] flex items-end justify-center overflow-visible">
        <img
          src={encodeURI("/Group 26.png")}
          alt=""
          className="w-full max-w-[145%] h-auto object-contain object-bottom select-none"
          style={{ minHeight: "160px" }}
        />
      </div>
    </div>
  );
};

export default AuthIllustration;
