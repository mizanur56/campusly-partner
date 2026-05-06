interface UniversityAboutProps {
  about: { title: string; description: string };
}

export default function UniversityAbout({ about }: UniversityAboutProps) {
  return (
    <article id="school-details" className="flex w-full flex-col items-start gap-4">
      <div className="flex w-full items-center gap-2">
        <h2 className="text-[24px] font-semibold text-[#20242A] md:text-[30px]">{about.title}</h2>
      </div>
      <p className="relative text-[18px] text-[#4B5563]">{about.description}</p>
    </article>
  );
}
