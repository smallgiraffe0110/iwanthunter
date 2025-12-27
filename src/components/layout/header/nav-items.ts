export const navItems = [
  {
    type: 'link',
    href: '/#upload',
    label: 'Upload',
  },
  {
    type: 'link',
    href: '/#how-it-works',
    label: 'How It Works',
  },
  {
    type: 'link',
    href: '/#faq',
    label: 'FAQ',
  },
] satisfies NavItem[];

type NavItem = Record<string, string | unknown> &
  (
    | {
        type: 'link';
        href: string;
      }
    | {
        type: 'dropdown';
      }
  );
