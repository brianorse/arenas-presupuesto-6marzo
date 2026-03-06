export const calcularTotales = (items: any[], pax: number, tipoExperiencia: string) => {
  let food = 0;
  let drinks = 0;
  let stations = 0;
  let staff = 0;
  let logistics = 0;

  items.forEach(item => {
    let itemTotal = 0;
    const quantity = item.quantity || 1;
    const price = item.price || 0;

    switch (item.pricingModel) {
      case 'per_person':
        itemTotal = price * pax * quantity;
        break;
      case 'per_piece':
        itemTotal = price * quantity * pax; // Assuming quantity is pieces per person
        break;
      case 'per_event':
        itemTotal = price * quantity;
        break;
      case 'per_hour':
        itemTotal = price * quantity; // Assuming quantity is hours
        break;
      default:
        itemTotal = price * quantity;
    }

    switch (item.category) {
      case 'food':
      case 'coffee':
      case 'appetizers':
      case 'starters':
      case 'mains':
      case 'desserts':
        food += itemTotal;
        break;
      case 'drinks':
      case 'mocktails':
      case 'vermut':
      case 'bodega':
        drinks += itemTotal;
        break;
      case 'stations':
        stations += itemTotal;
        break;
      case 'staff':
        staff += itemTotal;
        break;
      case 'logistics':
        logistics += itemTotal;
        break;
      default:
        // Fallback or other categories
        break;
    }
  });

  const total = food + drinks + stations + staff + logistics;
  const perPax = pax > 0 ? total / pax : 0;

  return {
    food,
    drinks,
    stations,
    staff,
    logistics,
    total,
    perPax
  };
};
