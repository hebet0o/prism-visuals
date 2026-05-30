import { useTranslation } from 'react-i18next';

export default function MaintenancePage() {
  const { t } = useTranslation();

  return (
    <div className="bg-brand-black min-h-[60vh] flex flex-col items-center justify-center">
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-brand-warm leading-relaxed mb-6">
            {t('maintenance.title')}
          </h1>
          <span className="divider-line" />
          <p className="text-brand-muted text-base leading-loose font-body font-light max-w-xl mx-auto mt-8">
            {t('maintenance.subtitle')}
          </p>
        </div>
      </section>
    </div>
  );
}
