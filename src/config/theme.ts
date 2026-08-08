// src/config/theme.ts
import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#0A192F", // สีกรมท่าลึกเข้ม
    colorLink: "#C5A059", // สีทองแชมเปญ
    colorSuccess: "#10B981",
    colorWarning: "#D4AF37",
    colorError: "#EF4444",
    fontSize: 16,
    fontFamily: `Prompt, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    borderRadius: 12,
  },
  components: {
    Button: {
      algorithm: true,
      controlHeight: 48,
      colorPrimary: "#0A192F",
      fontSize: 16,
      fontWeight: 600,
      borderRadius: 12,
    },
    Input: {
      borderRadius: 10,
      controlHeight: 46,
    },
    Select: {
      borderRadius: 10,
      controlHeight: 46,
    },
  },
};

export default theme;
