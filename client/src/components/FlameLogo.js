export default function FlameLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C12 2 7 7 7 12.5C7 15.538 9.239 18 12 18C14.761 18 17 15.538 17 12.5C17 10.5 16 9 16 9C16 9 15.5 11 14 11C14 11 15 9.5 13.5 7C13.5 7 13 9 11.5 10C11.5 10 12 7.5 12 2Z"
        fill="#dc2626"
        style={{ filter: 'drop-shadow(0 0 8px rgba(220,38,38,0.9))' }}
      />
      <path
        d="M12 22C10.343 22 9 20.657 9 19C9 17.5 10 16.5 10 16.5C10 16.5 10.5 17.5 12 17.5C13.5 17.5 14 16.5 14 16.5C14 16.5 15 17.5 15 19C15 20.657 13.657 22 12 22Z"
        fill="#7f1d1d"
      />
    </svg>
  );
}
