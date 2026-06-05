// src/components/AuditNotice.tsx
import { useLanguage } from "../providers/LanguageProvider";

const DEFIBOX_AUDIT_REPORTS_URL = "https://github.com/DefiboxTeam/Defibox-document/tree/master/AuditReport";

export function AuditNotice() {
  const { t } = useLanguage();

  return (
    <p className="auditNotice">
      {t("audit.notice")}{" "}
      <a href={DEFIBOX_AUDIT_REPORTS_URL} target="_blank" rel="noopener noreferrer">
        {t("audit.viewReport")}
      </a>
    </p>
  );
}
