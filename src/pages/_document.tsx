import { Html, Head, Main, NextScript } from "next/document";
import { KMUTT_CI } from "@/constants/colors";

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
        <meta name="theme-color" content={KMUTT_CI.orange} />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="KMUTT Open House - เปิดบ้าน KMUTT Ratchaburi มดออนทัวร์ @นครปฐม" />
        <meta
          property="og:description"
          content="เปิดบ้าน KMUTT Ratchaburi มดออนทัวร์ @นครปฐม | วันเสาร์ที่ 21 พฤศจิกายน 2569 ณ โรงแรมเซ็น จ.นครปฐม"
        />
        <meta property="og:image" content="/images/og_banner_mod_ontour.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="500" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://openhouse.kmutt.ac.th" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="KMUTT Open House - เปิดบ้าน KMUTT Ratchaburi มดออนทัวร์ @นครปฐม" />
        <meta
          name="twitter:description"
          content="เปิดบ้าน KMUTT Ratchaburi มดออนทัวร์ @นครปฐม | วันเสาร์ที่ 21 พฤศจิกายน 2569 ณ โรงแรมเซ็น จ.นครปฐม"
        />
        <meta name="twitter:image" content="/images/og_banner_mod_ontour.png" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
