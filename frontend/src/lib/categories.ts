export const DEFAULT_CATEGORIES = [
  'Alimentação', 'Aluguel', 'Combustível', 'Contas',
  'Educação', 'Farmácia', 'Freelance', 'Investimento',
  'Lazer', 'Mercado', 'Moradia', 'Outros',
  'Pets', 'Reembolso', 'Restaurante', 'Salário',
  'Saúde', 'Streaming', 'Transferência', 'Transporte',
  'Vestuário', 'Viagem',
];

export const CATEGORY_ICONS: Record<string, string> = {
  'Alimentação': '🍽️',
  'Aluguel': '🏠',
  'Combustível': '⛽',
  'Contas': '📄',
  'Educação': '📚',
  'Farmácia': '💊',
  'Freelance': '💻',
  'Investimento': '📈',
  'Lazer': '🎮',
  'Mercado': '🛒',
  'Moradia': '🏡',
  'Outros': '📦',
  'Pets': '🐾',
  'Reembolso': '↩️',
  'Restaurante': '🍴',
  'Salário': '💰',
  'Saúde': '❤️',
  'Streaming': '📺',
  'Transferência': '↔️',
  'Transporte': '🚌',
  'Vestuário': '👕',
  'Viagem': '✈️',
};

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? '🏷️';
}
