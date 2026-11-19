import type { Config } from 'tailwindcss';

// 用眼睛發力的設計色票：「夜晚的古堡交誼廳」。
// 深夜色當底、深木與紅磚撐起結構、羊皮紙色寫字、
// 琥珀燈光留給主要操作、月光藍用在鍵盤焦點。
// 圓角幾乎不用，陰影是 2px 的硬邊位移，和像素場景一致。
// 顏色依「用途」命名（背景、文字、強調），之後換主題只需要改這裡。
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#15121a', // 頁面背景
        surface: '#21191d', // 卡片、輸入框、面板
        wood: '#422723', // 卡片底座、結構線條
        brick: '#824c48',
        edge: '#795341', // 邊框與分隔線
        parchment: '#f6e0b4', // 主要文字
        muted: '#d2b696', // 次要文字
        moss: '#657958',
        amber: '#ffc782', // 主要操作、目前選取
        'on-amber': '#291b19', // 放在琥珀色上的文字
        moon: '#94accf', // 焦點框、提示
        heart: '#ef8a74', // 喜好愛心、錯誤訊息
        shadow: '#120d12',
      },
      fontFamily: {
        serif: ['"Noto Serif TC"', '"PMingLiU"', 'serif'],
        sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '2px',
      },
      boxShadow: {
        pixel: '2px 2px 0 #120d12',
        'pixel-lg': '4px 4px 0 #120d12',
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;
