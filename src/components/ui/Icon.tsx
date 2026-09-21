import type { SVGProps } from "react";

const paths: Record<string, string> = {
  search: "M11 4a7 7 0 1 0 4.9 12l4.6 4.6 1.4-1.4-4.6-4.6A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z",
  cart: "M3 4h2.2l2.4 10.2A2 2 0 0 0 9.5 15.8H18a2 2 0 0 0 1.9-1.4L22 7H7.3M9 20a1 1 0 1 0 0 .01M18 20a1 1 0 1 0 0 .01",
  phone: "M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  chevronDown: "m6 9 6 6 6-6",
  chevronRight: "m9 6 6 6-6 6",
  chevronLeft: "m15 6-6 6 6 6",
  arrowRight: "M5 12h14m-6-6 6 6-6 6",
  arrowLeft: "M19 12H5m6-6-6 6 6 6",
  check: "m5 12 5 5L20 7",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c-3 3-3 15 0 18m0-18c3 3 3 15 0 18M3 12h18",
  mapPin: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2",
  star: "m12 3 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.4l-5.7 3.1 1.2-6.4L2.8 9.7l6.4-.8L12 3Z",
  shield: "M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Zm-3 9 2 2 4-4",
  tag: "M20 12 12 20 4 12V4h8l8 8ZM8 8h.01",
  truck: "M3 6h11v10H3zM14 9h4l3 3v4h-7zM7 19a2 2 0 1 0 0-.01M18 19a2 2 0 1 0 0-.01",
  store: "M4 9 6 4h12l2 5M4 9h16v11H4zM4 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0M10 20v-6h4v6",
  minus: "M5 12h14",
  plus: "M12 5v14M5 12h14",
  zoomIn: "M11 4a7 7 0 1 0 4.9 12l4.6 4.6 1.4-1.4-4.6-4.6A7 7 0 0 0 11 4Zm-3 7h6m-3-3v6",
  external: "M14 4h6v6m0-6L10 14M20 14v6H4V4h6",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 8v5m0-9v1",
  alert: "M12 3 2 20h20L12 3Zm0 7v4m0 3v1",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
  wifiOff: "M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 3-2M12 20h.01M19 13a10 10 0 0 0-4-2.5M2 9a15 15 0 0 1 5-3M22 9a15 15 0 0 0-7-3.7",
  image: "M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M16 9h.01",
  filter: "M4 6h16M7 12h10M10 18h4",
  sort: "M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  sparkle: "m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z",
  hand: "M8 13V6a1.5 1.5 0 0 1 3 0v6m0-7a1.5 1.5 0 0 1 3 0v7m0-5a1.5 1.5 0 0 1 3 0v6a6 6 0 0 1-12 0v-3a1.5 1.5 0 0 1 3 0",
  wallet: "M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 0a2 2 0 0 1 2-2h11v2M16 13h5v4h-5a2 2 0 0 1 0-4Z",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  ruler: "M3 17 17 3l4 4L7 21l-4-4Zm4-4 2 2m1-5 2 2m1-5 2 2",
  package: "M3 7l9-4 9 4v10l-9 4-9-4V7Zm9 4 9-4M12 11 3 7m9 4v10",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, strokeWidth = 1.8, className, ...rest }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  const d = paths[name];
  const filled = name === "star" && className?.includes("fill-current");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}
