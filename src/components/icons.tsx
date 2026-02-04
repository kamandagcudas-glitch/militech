import type { SVGProps } from 'react';

/* This is the creator easter egg badge */
export function CreatorBadgeIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M13.33 6.67l4-2.67l-2 4l2 4l-4-2.67l-4 2.67l2-4l-2-4l4 2.67z" fill="gold" />
            <path d="m10.67 17.33l-4 2.67l2-4l-2-4l4 2.67l4-2.67l-2 4l2 4z" fill="gold" />
        </svg>
    );
}

export function GamepadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <path d="M18 13h-2" />
      <path d="M17 12v-2" />
      <path d="M12 2a10 10 0 0 0-9.4 12.5c.3.6.9.9 1.5.9h15.8c.6 0 1.2-.3 1.5-.9A10 10 0 0 0 12 2Z" />
    </svg>
  );
}