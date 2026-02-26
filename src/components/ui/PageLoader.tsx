import { motion } from "framer-motion";

const LOGO_SRC = "/images/logo/logo.svg";

type PageLoaderProps = {
  fullScreen?: boolean;
  compact?: boolean;
};

const PageLoader = ({ fullScreen = true, compact = false }: PageLoaderProps) => {
  const sizeClass = compact ? "w-[60px] h-[60px]" : "w-[100px] h-[100px] md:w-[120px] md:h-[120px]";
  const logoSizeClass = compact ? "h-8 w-8" : "h-14 w-14 md:h-16 md:w-16";

  const content = (
    <div className={`relative ${sizeClass}`}>
      {/* Animated rings - campus transfer style */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary-500"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute rounded-full border-b-2 border-l-2 border-primary-500/70 ${compact ? "inset-1" : "inset-2"}`}
      />

      {/* Logo - centered */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="absolute inset-0 z-10 flex items-center justify-center"
      >
        <div className={`flex items-center justify-center p-2 ${logoSizeClass}`}>
          <img
            src={LOGO_SRC}
            alt="Campus Transfer"
            className="h-full w-full object-contain"
          />
        </div>
      </motion.div>
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-neutral-50"
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center bg-neutral-50/50 ${compact ? "min-h-[120px] py-6" : "min-h-[400px]"}`}
    >
      {content}
    </div>
  );
};

export default PageLoader;
