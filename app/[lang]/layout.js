import { locales } from '@/lib/i18n';

// Generate static params for all locales
export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Generate metadata for each locale
export async function generateMetadata({ params }) {
  const { lang } = await params;

  const titles = {
    en: 'GoHolidays - Nepal-Thailand Travel Specialists',
    th: 'GoHolidays - ผู้เชี่ยวชาญการท่องเที่ยวเนปาล-ไทย',
    zh: 'GoHolidays - 尼泊尔-泰国旅行专家'
  };

  const descriptions = {
    en: 'Expert-curated travel experiences between Nepal and Thailand. Discover the perfect blend of Himalayan mountains and tropical beaches with our specialized tours.',
    th: 'ประสบการณ์การเดินทางที่คัดสรรโดยผู้เชี่ยวชาญระหว่างเนปาลและไทย ค้นพบการผสมผสานที่ลงตัวระหว่างเทือกเขาหิมาลัยและชายหาดเขตร้อนกับทัวร์พิเศษของเรา',
    zh: '专家策划的尼泊尔和泰国之间的旅行体验。通过我们的专业旅游探索喜马拉雅山脉和热带海滩的完美融合。'
  };

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
  };
}

// This layout wraps all localized pages.
// NOTE: No loading.js exists at this level — each page has its own.
// This prevents a parent skeleton from flashing before page-specific ones.
export default async function LangLayout({ children, params }) {
  const { lang } = await params;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang = '${lang || 'en'}';`,
        }}
      />
      {children}
    </>
  );
}
