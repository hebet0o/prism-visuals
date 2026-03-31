import { Link } from 'react-router-dom'

const PricingCard = ({ name, price, features, buttonText, featured = false }) => {
  return (
    <div
      className={`flex flex-col border transition-colors duration-400 ${
        featured
          ? 'border-brand-bronze bg-brand-dark'
          : 'border-brand-charcoal bg-brand-black hover:border-brand-bronze/50'
      }`}
    >
      <div className="p-10 flex flex-col flex-1">
        <p className="section-label mb-4">{name}</p>
        <span className="block w-8 h-px bg-brand-bronze mb-6" />
        <p className="font-display text-3xl text-brand-warm mb-8">{price}</p>
        <ul className="space-y-4 mb-10 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="block w-1.5 h-1.5 rounded-full bg-brand-bronze mt-1.5 flex-shrink-0" />
              <span className="text-brand-muted text-sm font-body font-light">{feature}</span>
            </li>
          ))}
        </ul>
        <Link
          to="/contact"
          className="btn-primary text-center block"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  )
}

export default PricingCard
