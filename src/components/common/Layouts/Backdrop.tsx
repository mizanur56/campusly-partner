import { useSidebar } from "../../../context/SidebarContext";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-[1px]"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
