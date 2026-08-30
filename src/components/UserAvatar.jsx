import React from 'react';

export default function UserAvatar({ name, photo, size = 36, onClick }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <button
      onClick={onClick}
      className="rounded-full overflow-hidden border-2 border-wari-saffron/30 hover:border-wari-saffron transition-all duration-200 flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {photo ? (
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full bg-gradient-to-br from-wari-saffron to-amber-600 flex items-center justify-center text-white font-bold"
          style={{ fontSize: size * 0.35 }}
        >
          {initials}
        </div>
      )}
    </button>
  );
}
