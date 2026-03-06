// Mock implementation of base44 client

let currentUser: any = null;

export const base44 = {
  auth: {
    login: async (email: string, role: string = 'user') => {
      currentUser = {
        email,
        full_name: email.split('@')[0],
        role
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      return currentUser;
    },
    me: async () => {
      if (!currentUser) {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
          currentUser = JSON.parse(stored);
        }
      }
      return currentUser;
    },
    logout: async () => { 
      currentUser = null;
      localStorage.removeItem('currentUser');
      window.location.href = '/Home';
    },
    redirectToLogin: (url: string) => { 
      window.location.href = '/Login';
    }
  },
  entities: {
    Presupuesto: {
      create: async (data: any) => { 
        const id = Math.random().toString(36).substr(2, 9);
        const newPresupuesto = { id, created_date: new Date().toISOString(), ...data };
        
        // Store in localStorage for persistence demo
        const stored = JSON.parse(localStorage.getItem('presupuestos') || '[]');
        stored.push(newPresupuesto);
        localStorage.setItem('presupuestos', JSON.stringify(stored));
        
        return newPresupuesto; 
      },
      list: async (sort: string, limit?: number) => {
        return JSON.parse(localStorage.getItem('presupuestos') || '[]');
      },
      filter: async (query: any, sort?: string) => {
        const all = JSON.parse(localStorage.getItem('presupuestos') || '[]');
        return all.filter((p: any) => {
          return Object.keys(query).every(key => p[key] === query[key]);
        });
      },
      update: async (id: string, data: any) => { 
        const all = JSON.parse(localStorage.getItem('presupuestos') || '[]');
        const index = all.findIndex((p: any) => p.id === id);
        if (index !== -1) {
          all[index] = { ...all[index], ...data };
          localStorage.setItem('presupuestos', JSON.stringify(all));
          return all[index];
        }
        return null;
      }
    },
    Cliente: {
      list: async (sort: string) => {
        // Mock clients derived from budgets or static list
        return [
          { id: '1', nombre: 'María García', email: 'maria@example.com', telefono: '600123456', etiqueta: 'vip' },
          { id: '2', nombre: 'Juan Pérez', email: 'juan@example.com', telefono: '600987654', etiqueta: 'potencial' }
        ];
      },
    }
  }
};
