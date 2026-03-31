import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Hero from '../components/presentational/Hero'
import ServiceCard from '../components/presentational/ServiceCard'
import GalleryGrid from '../components/presentational/GalleryGrid'
import { PLACEHOLDER_IMAGES } from '../utils/constants'

const DUMMY_TESTIMONIAL = {
  quote: "Working with Prism Visuals was unlike anything we expected. They didn't just take photos — they told the story of our day in a way we could never have imagined.",
  author: "Anna & David",
  event: "Budapest, September 2025",
}

const HomePage = () => {
  const { t } = useTranslation()

  const featuredImages = PLACEHOLDER_IMAGES.portfolio.slice(0, 6)

  return (
    <div className="bg-brand-black">
      <Hero
        images={PLACEHOLDER_IMAGES.hero}
        title={t('hero.title')}
        tagline={t('hero.tagline')}
        ctaText={t('hero.cta')}
        ctaLink="/portfolio"
      />

      {/* Intro — story-first */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="section-label mb-8">Our Philosophy</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-brand-warm leading-relaxed mb-8">
            You live the moment —<br />
            <span className="italic text-brand-offwhite/70">we turn it into something eternal.</span>
          </h2>
          <span className="divider-line" />
          <p className="text-brand-muted text-base leading-loose font-body font-light max-w-xl mx-auto">
            We are a Budapest-based photography and cinematography duo. Every project we take on is a collaboration — rooted in trust, driven by artistry, and measured by emotion.
          </p>
        </div>
      </section>

      {/* Featured Work — full bleed grid */}
      <section className="pb-4">
        <div className="text-center mb-10 px-6">
          <p className="section-label mb-3">{t('home.featuredTitle')}</p>
          <span className="divider-line" />
        </div>
        <GalleryGrid images={featuredImages} columns={3} />
        <div className="text-center mt-12 pb-8">
          <Link to="/portfolio" className="btn-primary">
            View Full Portfolio
          </Link>
        </div>
      </section>

      {/* Testimonial — cinematic quote */}
      <section className="py-28 px-6 bg-brand-dark">
        <div className="max-w-3xl mx-auto text-center">
          <p className="section-label mb-10">From Our Couples</p>
          <blockquote className="font-display italic text-2xl md:text-3xl text-brand-warm/90 leading-relaxed mb-10">
            &ldquo;{DUMMY_TESTIMONIAL.quote}&rdquo;
          </blockquote>
          <span className="divider-line" />
          <p className="font-heading text-xs uppercase tracking-display text-brand-bronze mt-6">
            {DUMMY_TESTIMONIAL.author}
          </p>
          <p className="font-heading text-xs uppercase tracking-widest text-brand-muted mt-1">
            {DUMMY_TESTIMONIAL.event}
          </p>
        </div>
      </section>

      {/* Services — dark grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-3">{t('home.servicesTitle')}</p>
            <span className="divider-line" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-charcoal">
            <ServiceCard
              title={t('services.wedding.title')}
              description={t('services.wedding.description')}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
            <ServiceCard
              title={t('services.portrait.title')}
              description={t('services.portrait.description')}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <ServiceCard
              title={t('services.event.title')}
              description={t('services.event.description')}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <ServiceCard
              title={t('services.video.title')}
              description={t('services.video.description')}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* CTA — full-bleed dark banner */}
      <section
        className="relative py-36 px-6 overflow-hidden"
        style={{
          backgroundImage: `url(${PLACEHOLDER_IMAGES.hero[1]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-brand-black/75" />
        <div className="relative max-w-2xl mx-auto text-center">
          <p className="section-label mb-8">{t('home.ctaTitle')}</p>
          <h2 className="font-display text-3xl md:text-5xl text-brand-warm leading-tight mb-6">
            {t('home.ctaText')}
          </h2>
          <span className="divider-line" />
          <div className="mt-10">
            <Link to="/contact" className="btn-ghost">
              {t('home.ctaButton')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
