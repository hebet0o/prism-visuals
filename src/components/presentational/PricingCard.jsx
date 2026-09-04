import { Link } from 'react-router-dom'

const PricingCard = ({ name, price, features, buttonText, featured = false, badge = '' }) => {
  const isFeatured = featured || !!badge

  return (
    <div
      className={`relative flex flex-col border transition-all duration-300 ${
        isFeatured
          ? 'border-brand-bronze bg-brand-dark shadow-lg shadow-brand-bronze/10'
          : 'border-brand-charcoal bg-brand-black hover:border-brand-bronze/50'
      }`}
    >
      {badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-brand-bronze text-brand-black text-[10px] font-bold tracking-widest uppercase rounded-full whitespace-nowrap shadow-md">
          {badge}
        </div>
      )}
      <div className="p-8 md:p-10 flex flex-col flex-1">
        <p className="section-label mb-3">{name}</p>
        <span className="block w-8 h-px bg-brand-bronze mb-6" />
        <div className="mb-8">
          <p className="font-display text-3xl md:text-4xl text-brand-warm flex items-baseline gap-1">
            {price}
            {price !== 'Custom Quote' && price !== 'Egyedi árajánlat' && (
              <span className="text-sm font-normal text-brand-muted font-body ml-1">Ft</span>
            )}
          </p>
        </div>
        <ul className="space-y-4 mb-10 flex-1">
          {features && features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="block w-1.5 h-1.5 rounded-full bg-brand-bronze mt-1.5 flex-shrink-0" />
              <span className="text-brand-muted text-sm font-body font-light leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
        <Link
          to="/contact"
          className={isFeatured ? "btn-primary text-center block" : "btn-secondary text-center block"}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  )
}

export default PricingCard
