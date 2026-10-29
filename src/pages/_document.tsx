import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="th">
      <Head>
        {/* Basic SEO */}
        <meta charSet="utf-8" />
        <meta
          name="description"
          content="KMUTT Open House 2025 - A Journey of Discovery | ค้นหาแรงบันดาลใจและเปิดประสบการณ์ใหม่กับทุกคณะและหน่วยงาน"
        />
        <meta
          name="keywords"
          content="KMUTT, Open House, Journey of Discovery, มจธ, พระจอมเกล้าธนบุรี, การศึกษา, คณะ, รับสมัคร"
        />
        <meta name="author" content="KMUTT" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Theme color */}
        <meta name="theme-color" content="#FA4616" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="KMUTT Open House 2025 - A Journey of Discovery" />
        <meta
          property="og:description"
          content="ร่วมเป็นส่วนหนึ่งของการเดินทางครั้งใหม่ Journey of Discovery | เปิดประสบการณ์กับทุกคณะและหน่วยงานของ มจธ."
        />
        <meta property="og:image" content="/images/banner.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://openhouse.kmutt.ac.th" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="KMUTT Open House 2025 - A Journey of Discovery" />
        <meta
          name="twitter:description"
          content="ค้นหาแรงบันดาลใจ และเริ่มต้น Journey of Discovery ไปกับ KMUTT"
        />
        <meta name="twitter:image" content="/images/banner.png" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
