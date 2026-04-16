import type { Locale } from "@/lib/site";
import type { TeamProfile } from "@/lib/team-data";

type ProfileCardProps = {
  profile: TeamProfile;
  locale: Locale;
};

export function ProfileCard({ profile, locale }: ProfileCardProps) {
  const verificationRows = [
    profile.verification.wbtvStatus[locale],
    profile.verification.rbtvStatus[locale],
    profile.verification.confidentiality[locale],
    profile.verification.qualityLevel[locale],
  ];

  return (
    <article className="panel px-6 py-6">
      <p className="eyebrow eyebrow-muted">
        {profile.swornStatus[locale]}
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-foreground">
        {profile.name}
      </h3>
      <p className="mt-2 text-base font-medium text-brand">
        {profile.title[locale]}
      </p>
      <p className="mt-4 text-base leading-8 text-muted">
        {profile.overview[locale]}
      </p>

      <div className="mt-6 grid gap-0 sm:grid-cols-2">
        <div className="panel-quiet pr-0 sm:pr-5">
          <h4 className="eyebrow eyebrow-muted">
            {locale === "nl" ? "Talen" : "اللغات"}
          </h4>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-muted">
            {profile.languages[locale].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="panel-quiet pr-0 sm:border-t-0 sm:pl-5">
          <h4 className="eyebrow eyebrow-muted">
            {locale === "nl" ? "Specialisaties" : "التخصصات"}
          </h4>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-muted">
            {profile.specializations[locale].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="panel-quiet pr-0 sm:pr-5">
          <h4 className="eyebrow eyebrow-muted">
            {locale === "nl" ? "Inzetgebieden" : "مجالات الاستخدام"}
          </h4>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-muted">
            {profile.serviceAreas[locale].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="panel-quiet pr-0 sm:border-t-0 sm:pl-5">
          <h4 className="eyebrow eyebrow-muted">
            {locale === "nl" ? "Kwaliteit en geheimhouding" : "الجودة والسرية"}
          </h4>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-muted">
            {profile.quality[locale].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-[1.4rem] border border-brand/10 bg-brand-soft/50 px-5 py-5">
        <h4 className="eyebrow eyebrow-muted">
          {locale === "nl" ? "Verificatievelden" : "حقول التحقق"}
        </h4>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-muted">
          {verificationRows.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
