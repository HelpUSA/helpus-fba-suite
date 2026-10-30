export interface NfeItem {
  itemNum: number;
  cProd: string;
  cEAN: string;
  xProd: string;
  NCM: string;
  CFOP: string;
  uCom: string;
  qCom: number;
  vUnCom: number;
  vProd: number;
  vFrete: number;
  effectiveUnitCost: number; // (vProd + vFrete) / qCom
}

export interface NfeData {
  chaveAcesso: string;
  numeroNF: string;
  serie: string;
  dataEmissao: string;
  naturezaOperacao: string;
  emitente: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    logradouro: string;
    numero: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
    telefone: string;
  };
  destinatario: {
    cnpjCpf: string;
    razaoSocial: string;
    logradouro: string;
    numero: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
    email: string;
  };
  totais: {
    valorProdutos: number;
    valorFrete: number;
    valorNota: number;
  };
  transporte: {
    transportadora: string;
    cnpjTransportadora: string;
    municipio: string;
    uf: string;
    volumes: number;
    pesoLiquido: number;
  };
  itens: NfeItem[];
}

function getTagValue(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

export function parseNfeXml(xmlString: string): NfeData {
  // Extract Chave de Acesso
  let chaveAcesso = '';
  const chNFeMatch = xmlString.match(/<chNFe[^>]*>([0-9]{44})<\/chNFe>/i);
  if (chNFeMatch) {
    chaveAcesso = chNFeMatch[1];
  } else {
    const idMatch = xmlString.match(/Id="NFe([0-9]{44})"/i);
    if (idMatch) chaveAcesso = idMatch[1];
  }

  // Ide section
  const ideBlock = xmlString.match(/<ide[^>]*>([\s\S]*?)<\/ide>/i)?.[1] || '';
  const numeroNF = getTagValue(ideBlock, 'nNF');
  const serie = getTagValue(ideBlock, 'serie');
  const dataEmissao = getTagValue(ideBlock, 'dhEmi') || getTagValue(ideBlock, 'dEmi');
  const naturezaOperacao = getTagValue(ideBlock, 'natOp');

  // Emit section
  const emitBlock = xmlString.match(/<emit[^>]*>([\s\S]*?)<\/emit>/i)?.[1] || '';
  const enderEmitBlock = emitBlock.match(/<enderEmit[^>]*>([\s\S]*?)<\/enderEmit>/i)?.[1] || '';
  const emitente = {
    cnpj: getTagValue(emitBlock, 'CNPJ') || getTagValue(emitBlock, 'CPF'),
    razaoSocial: getTagValue(emitBlock, 'xNome'),
    nomeFantasia: getTagValue(emitBlock, 'xFant'),
    logradouro: getTagValue(enderEmitBlock, 'xLgr'),
    numero: getTagValue(enderEmitBlock, 'nro'),
    bairro: getTagValue(enderEmitBlock, 'xBairro'),
    municipio: getTagValue(enderEmitBlock, 'xMun'),
    uf: getTagValue(enderEmitBlock, 'UF'),
    cep: getTagValue(enderEmitBlock, 'CEP'),
    telefone: getTagValue(enderEmitBlock, 'fone'),
  };

  // Dest section
  const destBlock = xmlString.match(/<dest[^>]*>([\s\S]*?)<\/dest>/i)?.[1] || '';
  const enderDestBlock = destBlock.match(/<enderDest[^>]*>([\s\S]*?)<\/enderDest>/i)?.[1] || '';
  const destinatario = {
    cnpjCpf: getTagValue(destBlock, 'CNPJ') || getTagValue(destBlock, 'CPF'),
    razaoSocial: getTagValue(destBlock, 'xNome'),
    logradouro: getTagValue(enderDestBlock, 'xLgr'),
    numero: getTagValue(enderDestBlock, 'nro'),
    bairro: getTagValue(enderDestBlock, 'xBairro'),
    municipio: getTagValue(enderDestBlock, 'xMun'),
    uf: getTagValue(enderDestBlock, 'UF'),
    cep: getTagValue(enderDestBlock, 'CEP'),
    email: getTagValue(destBlock, 'email'),
  };

  // Total section
  const totalBlock = xmlString.match(/<ICMSTot[^>]*>([\s\S]*?)<\/ICMSTot>/i)?.[1] || '';
  const totais = {
    valorProdutos: parseFloat(getTagValue(totalBlock, 'vProd')) || 0,
    valorFrete: parseFloat(getTagValue(totalBlock, 'vFrete')) || 0,
    valorNota: parseFloat(getTagValue(totalBlock, 'vNF')) || 0,
  };

  // Transp section
  const transpBlock = xmlString.match(/<transp[^>]*>([\s\S]*?)<\/transp>/i)?.[1] || '';
  const transportaBlock = transpBlock.match(/<transporta[^>]*>([\s\S]*?)<\/transporta>/i)?.[1] || '';
  const volBlock = transpBlock.match(/<vol[^>]*>([\s\S]*?)<\/vol>/i)?.[1] || '';
  const transporte = {
    transportadora: getTagValue(transportaBlock, 'xNome'),
    cnpjTransportadora: getTagValue(transportaBlock, 'CNPJ'),
    municipio: getTagValue(transportaBlock, 'xMun'),
    uf: getTagValue(transportaBlock, 'UF'),
    volumes: parseInt(getTagValue(volBlock, 'qVol')) || 1,
    pesoLiquido: parseFloat(getTagValue(volBlock, 'pesoL')) || 0,
  };

  // Det (Items) section
  const itens: NfeItem[] = [];
  const detRegex = /<det\s+nItem="(\d+)"[^>]*>([\s\S]*?)<\/det>/gi;
  let detMatch;

  while ((detMatch = detRegex.exec(xmlString)) !== null) {
    const itemNum = parseInt(detMatch[1]);
    const detContent = detMatch[2];
    const prodBlock = detContent.match(/<prod[^>]*>([\s\S]*?)<\/prod>/i)?.[1] || '';

    const qCom = parseFloat(getTagValue(prodBlock, 'qCom')) || 1;
    const vUnCom = parseFloat(getTagValue(prodBlock, 'vUnCom')) || 0;
    const vProd = parseFloat(getTagValue(prodBlock, 'vProd')) || (qCom * vUnCom);
    const vFrete = parseFloat(getTagValue(prodBlock, 'vFrete')) || 0;
    const effectiveUnitCost = parseFloat(((vProd + vFrete) / qCom).toFixed(2));

    itens.push({
      itemNum,
      cProd: getTagValue(prodBlock, 'cProd'),
      cEAN: getTagValue(prodBlock, 'cEAN'),
      xProd: getTagValue(prodBlock, 'xProd'),
      NCM: getTagValue(prodBlock, 'NCM'),
      CFOP: getTagValue(prodBlock, 'CFOP'),
      uCom: getTagValue(prodBlock, 'uCom') || 'UN',
      qCom,
      vUnCom,
      vProd,
      vFrete,
      effectiveUnitCost,
    });
  }

  return {
    chaveAcesso,
    numeroNF,
    serie,
    dataEmissao,
    naturezaOperacao,
    emitente,
    destinatario,
    totais,
    transporte,
    itens,
  };
}
