export const createPageUrl = (page: string) => `/${page}`;

export const LOGO_URL = 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png'; // Minimalist cloche icon

export const generateBudgetCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar chars like I, 1, O, 0
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export * from './reportGenerator';
