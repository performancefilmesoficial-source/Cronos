import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: {
    appIsrStatus: false, // Pode ser que em algumas subversões aceite, mas Next 15 com Turbopack usa `position`
    buildActivityPosition: 'bottom-right',
    position: 'bottom-left'
  } as any,
};

export default nextConfig;
