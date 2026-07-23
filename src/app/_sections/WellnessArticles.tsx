import Link from "next/link";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { getArticles } from "@/lib/db/queries";

export async function WellnessArticlesSection() {
  const rows = await getArticles();
  const articles = rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    desc: row.summary,
    image: row.image_url,
    tag: row.tag,
    readTime: row.read_time,
    author: `${row.author_name}, ${row.author_role}`,
  }));

  if (articles.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/8 text-brand tracking-wide mb-4">
            Educational Center
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900">
            Featured <span className="gradient-text">Wellness & Medical Articles</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Empower yourself with doctor-approved content written specifically for women's reproductive health journeys.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((art, idx) => (
            <ScrollReveal key={art.title} delay={idx * 80}>
              <Link href={`/articles/${art.slug}`} className="block h-full">
                <article className="group h-full flex flex-col justify-between bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-brand/35 hover:-translate-y-1 transition-all duration-300">
                  <div>
                    <div className="relative h-52 w-full overflow-hidden bg-slate-50">
                      <img
                        src={art.image || "/images/logo.png"}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[10px] font-bold text-brand px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">
                        {art.tag}
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-2">
                        <span>{art.readTime}</span>
                        <span>•</span>
                        <span>By {art.author}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 leading-snug group-hover:text-brand transition-colors duration-200">
                        {art.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {art.desc}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <span className="text-xs font-bold text-brand group-hover:text-brand-deep flex items-center gap-1">
                      Read Full Article &rarr;
                    </span>
                  </div>
                </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
