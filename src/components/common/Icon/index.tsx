/**
 * Icon 图标组件
 * 基于 Lucide Icons 封装，支持自定义尺寸和颜色
 */

import { 
  Play, 
  Pause, 
  Mic, 
  MicOff,
  Volume2, 
  VolumeX,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Star,
  Heart,
  Lock,
  Unlock,
  Book,
  BookOpen,
  Map,
  Home,
  Settings,
  User,
  Trophy,
  Zap,
  Sparkles,
  Gift,
  Camera,
  Download,
  Share2,
  QrCode,
  Menu,
  Search,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RefreshCw,
  Eye,
  EyeOff,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import styles from './Icon.module.css';

// 图标映射表
const iconMap: Record<string, LucideIcon> = {
  play: Play,
  pause: Pause,
  mic: Mic,
  'mic-off': MicOff,
  'volume-on': Volume2,
  'volume-off': VolumeX,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  close: X,
  check: Check,
  star: Star,
  heart: Heart,
  lock: Lock,
  unlock: Unlock,
  book: Book,
  'book-open': BookOpen,
  map: Map,
  home: Home,
  settings: Settings,
  user: User,
  trophy: Trophy,
  zap: Zap,
  sparkles: Sparkles,
  gift: Gift,
  camera: Camera,
  download: Download,
  share: Share2,
  qrcode: QrCode,
  menu: Menu,
  search: Search,
  info: Info,
  warning: AlertCircle,
  success: CheckCircle,
  error: XCircle,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  reset: RotateCcw,
  refresh: RefreshCw,
  'eye-on': Eye,
  'eye-off': EyeOff,
};

export type IconName = keyof typeof iconMap;

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface IconProps {
  /** 图标名称 */
  name: IconName;
  /** 图标尺寸 */
  size?: IconSize | number;
  /** 图标颜色 */
  color?: string;
  /** 线条粗细 */
  strokeWidth?: number;
  /** 自定义类名 */
  className?: string;
  /** 点击事件 */
  onClick?: () => void;
}

// 尺寸映射
const sizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color,
  strokeWidth = 2,
  className,
  onClick,
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const pixelSize = typeof size === 'number' ? size : sizeMap[size];

  return (
    <span
      className={clsx(styles.icon, onClick && styles.clickable, className)}
      style={{ color }}
      onClick={onClick}
    >
      <IconComponent size={pixelSize} strokeWidth={strokeWidth} />
    </span>
  );
};

// 导出所有图标名称供类型使用
export const iconNames = Object.keys(iconMap) as IconName[];

export default Icon;

