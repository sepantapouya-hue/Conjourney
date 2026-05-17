export default function Logo({ size = 32, className }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        fill="#8678FA"
        d="M58 8c19 0 31 14 31 33v118c0 11-9 18-20 16L33 167c-15-3-25-17-23-32L26 36C29 19 41 8 58 8z"
      />
      <path
        fill="#FF8E70"
        d="M120 8h44c14 0 24 11 24 25v45c0 16-15 27-31 23l-48-13c-15-4-23-19-19-34l8-29C101 14 110 8 120 8z"
      />
      <path
        fill="#8BD6F0"
        d="M111 102c-4-1-7 3-5 7l44 16c15 5 24 19 22 35l-4 16c-3 12-14 21-26 21h-25c-15 0-26-11-28-26L97 144c-2-16 9-31 25-32z"
      />
    </svg>
  );
}
