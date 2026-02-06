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

/* This is the Angelic Power Rune easter egg badge */
export function AngelicPowerRuneIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 512 512"
            fill="currentColor"
            {...props}
        >
            <path d="M256,512C114.62,512,0,397.38,0,256S114.62,0,256,0,512,114.62,512,256,397.38,512,256,512Zm0-448C141.31,64,64,141.31,64,256s77.31,192,192,192,192-77.31,192-192S370.69,64,256,64Z"/>
            <path d="M384,224c0-35.35-85.45-64-128-64s-128,28.65-128,64,38.33,80,128,80S384,259.35,384,224Z"/>
        </svg>
    );
}

/* This is the Raytheon easter egg insignia */
export function BlackFlameIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12 2c2.4 4.5 7 8.3 7 12.5c0 3.1-2.2 5.5-5 5.5s-5-2.4-5-5.5c0-4.2 4.6-8 7-12.5z" stroke="hsl(var(--foreground))" fill="hsl(var(--foreground))" className="animate-black-flame-main" />
            <path d="M10.1 13.9c-1-1.3-1.6-2.9-1.6-4.4c0-2.8 1.8-5.2 4.5-5.2s4.5 2.4 4.5 5.2c0 1.5-.6 3.1-1.6 4.4" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" className="animate-black-flame-inner" />
        </svg>
    );
}
