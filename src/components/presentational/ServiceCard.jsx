const ServiceCard = ({ title, description, icon }) => {
  return (
    <div className="group flex flex-col items-start p-8 border border-brand-charcoal hover:border-brand-bronze transition-colors duration-400">
      {icon && (
        <div className="mb-6 text-brand-bronze opacity-70 group-hover:opacity-100 transition-opacity duration-400">
          {icon}
        </div>
      )}
      <h3 className="section-label mb-4">{title}</h3>
      <span className="block w-8 h-px bg-brand-bronze mb-4 group-hover:w-16 transition-all duration-400" />
      <p className="text-brand-muted text-sm leading-relaxed font-body font-light">
        {description}
      </p>
    </div>
  )
}

export default ServiceCard
