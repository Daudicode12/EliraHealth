import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleBySlug, getArticles, ArticleSection } from "@/lib/db/queries";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ArrowLeft, Clock, Calendar, ShieldCheck, ChatTeardropText } from "@phosphor-icons/react/dist/ssr";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const articleRow = await getArticleBySlug(slug);

  if (!articleRow) {
    notFound();
  }

  const article = {
    ...articleRow,
    author: articleRow.author_name,
    authorRole: articleRow.author_role,
    readTime: articleRow.read_time,
    image: articleRow.image_url,
    date: new Date(articleRow.created_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    sections: JSON.parse(articleRow.content) as ArticleSection[],
  };

  // Suggest other articles as reads
  const allArticles = await getArticles();
  const otherArticles = allArticles
    .filter((a) => a.slug !== slug)
    .slice(0, 2)
    .map((a) => ({ slug: a.slug, tag: a.tag, title: a.title, summary: a.summary }));

  return (
    <PublicLayout>
      <article className="min-h-screen bg-slate-50/50 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-brand transition-colors duration-200 mb-8"
          >
            <ArrowLeft size={16} weight="bold" />
            Back to Home
          </Link>

          {/* Article Header info */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/8 text-brand tracking-wide">
              {article.tag}
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {article.title}
            </h1>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {article.summary}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 border-y border-slate-200/60 py-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <div className="text-slate-800 font-bold">{article.author}</div>
                  <div className="text-[10px] text-muted-foreground">{article.authorRole}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-slate-400" />
                <span>{article.date}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock size={16} className="text-slate-400" />
                <span>{article.readTime}</span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-600 ml-auto">
                <ShieldCheck size={18} weight="fill" />
                <span>Medical-Grade Reviewed</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mt-8 rounded-3xl overflow-hidden aspect-[21/9] bg-slate-100 border border-slate-200">
            <img
              src={article.image || "/images/logo.png"}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Reading body */}
          <div className="mt-12 bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm">
            <div className="max-w-3xl mx-auto space-y-10">
              {article.sections.map((sect, i) => (
                <div key={i} className="space-y-4">
                  {sect.heading && (
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                      {sect.heading}
                    </h2>
                  )}
                  {sect.content.map((para, j) => (
                    <p
                      key={j}
                      className="text-slate-600 text-sm md:text-base leading-relaxed"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action for consultation */}
          <div className="mt-12 rounded-3xl bg-gradient-to-br from-brand/5 to-brand-deep/5 border border-brand/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-bold text-slate-800 text-lg flex items-center justify-center md:justify-start gap-2">
                <ChatTeardropText size={22} className="text-brand" />
                Need Personalized Medical Guidance?
              </h3>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                Connect directly with certified OB-GYNs, maternal wellness experts, and nutrition specialists tailored to your health status.
              </p>
            </div>
            <Link
              href="/signup/user"
              className="px-6 py-3 bg-brand hover:bg-brand-deep text-white font-semibold rounded-xl text-xs shadow-md shadow-brand/20 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              Book Consultation
            </Link>
          </div>

          {/* Related Articles */}
          <div className="mt-20 border-t border-slate-200/60 pt-16 space-y-8">
            <h4 className="font-bold text-slate-800 text-lg">Related Reading Material</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherArticles.map((art) => (
                <Link
                  key={art.slug}
                  href={`/articles/${art.slug}`}
                  className="group block bg-white border border-slate-200 hover:border-brand/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                    {art.tag}
                  </span>
                  <h5 className="font-bold text-slate-800 text-sm mt-2 group-hover:text-brand transition-colors duration-200">
                    {art.title}
                  </h5>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                    {art.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </article>
    </PublicLayout>
  );
}
