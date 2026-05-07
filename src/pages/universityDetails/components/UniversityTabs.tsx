const navItems = [
  { label: "School Details", id: "school-details" },
  { label: "Programs", id: "programs" },
  { label: "Campus", id: "campus" },
  { label: "Required Documents", id: "required-document" },
  { label: "FAQ", id: "faqs" },
];

export default function UniversityTabs() {
  return (
    <nav className="flex w-full flex-wrap items-center gap-2">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            const section = document.getElementById(item.id);
            if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="h-10 cursor-pointer rounded-[50px] bg-[#EDEEEF] px-4 text-[13px] text-[#4B5563] transition-colors hover:bg-[#DFE1E3] md:text-[14px]"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
