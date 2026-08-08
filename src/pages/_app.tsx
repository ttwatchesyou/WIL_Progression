import type { AppProps } from "next/app";
import { ConfigProvider } from "antd";
import thTH from "antd/locale/th_TH";
import theme from "@/config/theme";
import "antd/dist/reset.css";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider locale={thTH} theme={theme}>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
