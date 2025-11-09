// lib/avatars.ts
export const getAvatarUrl = (name: string, background: string = '4F46E5'): string => {
  if (!name) return `https://ui-avatars.com/api/?background=${background}&color=fff`;
  // Clean name: trim, replace spaces with +, encode
  const cleanName = encodeURIComponent(name.trim().replace(/\s+/g, '+'));
  // Return clean, valid URL
  return `https://ui-avatars.com/api/?name=${cleanName}&background=${background}&color=fff`;
};