export const createPageUrl = (page: string) => `/${page}`;

export const LOGO_URL = 'https://drive.google.com/thumbnail?id=1jUPmclrOp5QoJMqIlvwOrTmHmR00C-0L&sz=w1000';

export const generateBudgetCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar chars like I, 1, O, 0
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
