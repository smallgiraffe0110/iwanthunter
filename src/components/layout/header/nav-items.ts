export type NavItem =
  | {
      type: 'link';
      href: string;
      label: string;
    }
  | {
      type: 'dropdown';
      label: string;
      items: Array<{
        href: string;
        label: string;
      }>;
    };

export const navItems: NavItem[] = [
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
];
