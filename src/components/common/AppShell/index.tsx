import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BookOpen, Map, Settings2, Sparkles, Sprout, WifiOff } from 'lucide-react';
import styles from './AppShell.module.css';

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}
const links = [
  { to: '/map', label: '魔法地图', icon: Map },
  { to: '/scroll', label: '成长记录', icon: Sprout },
  { to: '/settings', label: '设置', icon: Settings2 },
];

export default function AppShell({ title, subtitle, children }: AppShellProps) {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return (
    <div className={styles.shell}>
      <a href="#page-content" className={styles.skip}>
        跳到主要内容
      </a>
      <aside className={styles.sidebar}>
        <Link to="/map" className={styles.brand} aria-label="Magic Buddy 首页">
          <span className={styles.brandIcon}>
            <BookOpen size={25} />
          </span>
          <span>
            Magic Buddy<small>让英语冒险开始</small>
          </span>
        </Link>
        <span className={styles.navCaption}>一起探索</span>
        <nav className={styles.nav} aria-label="主导航">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <Icon size={21} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarNote}>
          <Sparkles size={24} aria-hidden="true" />
          <strong>小小一步，也有魔法。</strong>
          <p>
            跟着自己的节奏，
            <br />
            每天发现一点新世界。
          </p>
          <span>GROW A LITTLE, EVERY DAY</span>
        </div>
        <div className={styles.sidebarFooter}>
          <span className={styles.dot} /> 共用设备 · 记录保存在本机
        </div>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>MAGIC ENGLISH BUDDY</span>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <Link to="/scroll" className={styles.profile} aria-label="查看本设备的学习记录">
            <Sparkles size={21} />
          </Link>
        </header>
        {offline && (
          <div className={styles.offline} role="status">
            <WifiOff size={16} /> 当前离线 · 可以继续阅读已下载的故事
          </div>
        )}
        <main id="page-content" className={styles.content} tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
