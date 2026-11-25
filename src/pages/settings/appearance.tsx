import AppearanceTabs from "@/components/appearance-tabs"
import Heading from "@/components/heading"
import SettingsLayout from "@/layouts/settings-layout"
import { useTranslation } from "@/lib/i18n"

export default function Appearance() {
  const { t } = useTranslation()

  return (
    <SettingsLayout>
      <h1 className="sr-only">{t("appearance.heading")}</h1>

      <div className="space-y-6">
        <Heading variant="small" title={t("appearance.heading")} description={t("appearance.description")} />
        <AppearanceTabs />
      </div>
    </SettingsLayout>
  )
}
