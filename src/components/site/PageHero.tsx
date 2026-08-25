export function PageHero({
  eyebrow,
  title,
  copy,
  image,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  image: string;
}) {
  return (
    <section className="relative h-[62vh] min-h-[420px] w-full overflow-hidden">
      <img
        src={image}
        alt=""
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/45" />
      <div className="container-x relative flex h-full items-end pb-14 text-white">
        <div className="rise max-w-2xl">
          <span className="eyebrow text-white/80">{eyebrow}</span>
          <h1 className="mt-4 text-5xl sm:text-6xl">{title}</h1>
          {copy && <p className="mt-5 max-w-lg leading-relaxed text-white/85">{copy}</p>}
        </div>
      </div>
    </section>
  );
}
