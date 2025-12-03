// API simples para processar OCR usando Google Vision
// Em produção, use a API oficial do Google Vision

export async function processReceipt(imageBase64: string) {
  try {
    // Simulação de OCR - em produção use Google Vision API
    const mockData = {
      amount: 89.90,
      date: new Date().toISOString().split('T')[0],
      merchant_name: 'MERCADO TESTE',
      category: 'Alimentação',
      confidence: 0.85
    };

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      data: mockData
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao processar imagem'
    };
  }
}

// Função para extrair valor monetário do texto
export function extractAmount(text: string): number {
  // Regex para encontrar valores monetários
  const moneyRegex = /R?\$\s*(\d+(?:[,.]\d{1,2})?)/gi;
  const matches = text.match(moneyRegex);
  
  if (matches && matches.length > 0) {
    // Pegar o maior valor encontrado
    const amounts = matches.map(match => {
      const cleanValue = match.replace(/R?\$\s*/, '').replace(',', '.');
      return parseFloat(cleanValue);
    });
    
    return Math.max(...amounts);
  }
  
  return 0;
}

// Função para extrair data do texto
export function extractDate(text: string): string {
  // Regex para datas brasileiras (DD/MM/YYYY ou DD-MM-YYYY)
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi;
  const matches = text.match(dateRegex);
  
  if (matches && matches.length > 0) {
    // Pegar a primeira data encontrada
    const dateStr = matches[0];
    const [day, month, year] = dateStr.split(/[\/\-]/);
    
    // Converter para formato ISO
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return new Date().toISOString().split('T')[0];
}