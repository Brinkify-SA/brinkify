// lib/avatars.ts
export const getAvatarUrl = (name: string, background: string = '4F46E5'): string => {
  if (!name) return `https://ui-avatars.com/api/?background=${background}&color=fff`;
  const cleanName = name.trim().replace(/\s+/g, '+');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=${background}&color=fff`;
};