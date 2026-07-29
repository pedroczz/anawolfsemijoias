type LogoProps = {
  className?: string;
  strokeWidth?: number;
  title?: string;
};

/**
 * Busto expositor de joalheria com colar, em traço único (currentColor).
 * Usado como marca da Ana Wolf Semijoias em qualquer cor de texto/fundo.
 */
export default function Logo({ className, strokeWidth = 2.2, title = "Ana Wolf Semijoias" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <path
        d="M84,36
           C84,30 92,26 100,26
           C108,26 116,30 116,36
           L116,50
           C132,58 148,72 154,92
           C160,112 158,140 150,164
           C144,182 132,192 100,192
           C68,192 56,182 50,164
           C42,140 40,112 46,92
           C52,72 68,58 84,50
           Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M62,86
           C70,104 84,114 100,114
           C116,114 130,104 138,86"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M100,114 L100,132"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M100,132 L108,144 L100,158 L92,144 Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}
