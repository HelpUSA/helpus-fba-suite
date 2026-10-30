import fs from 'fs';
import path from 'path';
import { NfeData } from './nfeParser';
import {
  WarehouseCode,
  WAREHOUSES,
  WarehouseInfo,
  InventoryItem,
  StockMovement,
  StoredInvoice,
  ErpDatabaseState,
} from './erpTypes';

export * from './erpTypes';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'erp_database.json');

// Initial seed data from Master Context
const INITIAL_DATABASE_STATE: ErpDatabaseState = {
  version: '2.0.0',
  lastUpdated: '2026-10-30T19:30:00Z',
  items: [
    {
      id: 'prod-us-cableties-2026',
      sku: 'HU-SIL-CABLE-FBA-2026',
      asin: 'B0HLTXWCV7',
      title: 'HelpUS Reusable Silicone Cable Ties 20 Pack Cord Management Straps',
      marketplace: 'Amazon US',
      currency: 'USD',
      unitCost: 1.25,
      salePrice: 9.99,
      imageUrl: '/images/products/silicone-cable-ties-main.jpg',
      supplierName: 'Teshuai Silicone / Shandsome',
      balances: {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 50,
        'WH-BR-TRANSIT-BRASPRESS': 0,
        'WH-BR-LOCAL-JPA': 0,
      },
      totalStock: 50,
      reorderPoint: 20,
    },
    {
      id: 'prod-br-nativos-01',
      sku: 'NAT-RESV-60CAPS',
      ncm: '21069030',
      title: 'Resveratrol Softgel 60 Cápsulas - Nativos do Brasil',
      marketplace: 'Amazon BR',
      currency: 'BRL',
      unitCost: 25.76,
      salePrice: 79.90,
      imageUrl: '/images/products/nat-resv-60caps.png',
      supplierName: 'Nativos do Brasil Produtos Naturais',
      balances: {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 0,
        'WH-BR-TRANSIT-BRASPRESS': 5,
        'WH-BR-LOCAL-JPA': 0,
      },
      totalStock: 5,
      reorderPoint: 3,
    },
    {
      id: 'prod-br-nativos-02',
      sku: 'NAT-MAG-TREON-60C',
      ncm: '21069030',
      title: 'Magnésio L-Treonato 60 Cápsulas - Nativos do Brasil',
      marketplace: 'Amazon BR',
      currency: 'BRL',
      unitCost: 15.80,
      salePrice: 59.90,
      imageUrl: '/images/products/nat-mag-treon-60c.png',
      supplierName: 'Nativos do Brasil Produtos Naturais',
      balances: {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 0,
        'WH-BR-TRANSIT-BRASPRESS': 5,
        'WH-BR-LOCAL-JPA': 0,
      },
      totalStock: 5,
      reorderPoint: 3,
    },
    {
      id: 'prod-br-nativos-03',
      sku: 'NAT-COQ10-VITE-60C',
      ncm: '21069030',
      title: 'Co-Q10 com Vitamina E 60 Cápsulas - Nativos do Brasil',
      marketplace: 'Amazon BR',
      currency: 'BRL',
      unitCost: 21.26,
      salePrice: 69.90,
      imageUrl: '/images/products/nat-coq10-vite-60c.png',
      supplierName: 'Nativos do Brasil Produtos Naturais',
      balances: {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 0,
        'WH-BR-TRANSIT-BRASPRESS': 5,
        'WH-BR-LOCAL-JPA': 0,
      },
      totalStock: 5,
      reorderPoint: 3,
    },
    {
      id: 'prod-br-nativos-04',
      sku: 'NAT-COLAG-VITC-60C',
      ncm: '21069030',
      title: 'Colágeno Hidrolisado com Vit C 60 Cápsulas - Nativos do Brasil',
      marketplace: 'Amazon BR',
      currency: 'BRL',
      unitCost: 17.93,
      salePrice: 54.90,
      imageUrl: '/images/products/nat-colageno-hidro-60c.png',
      supplierName: 'Nativos do Brasil Produtos Naturais',
      balances: {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 0,
        'WH-BR-TRANSIT-BRASPRESS': 5,
        'WH-BR-LOCAL-JPA': 0,
      },
      totalStock: 5,
      reorderPoint: 3,
    },
    {
      id: 'prod-br-nativos-05',
      sku: 'NAT-6MAG-60C',
      ncm: '21069030',
      title: '6 Magnésios Quelato & Complex 60 Cápsulas - Nativos do Brasil',
      marketplace: 'Amazon BR',
      currency: 'BRL',
      unitCost: 18.41,
      salePrice: 59.90,
      imageUrl: '/images/products/nat-6mag-60caps.png',
      supplierName: 'Nativos do Brasil Produtos Naturais',
      balances: {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 0,
        'WH-BR-TRANSIT-BRASPRESS': 5,
        'WH-BR-LOCAL-JPA': 0,
      },
      totalStock: 5,
      reorderPoint: 3,
    },
    {
      id: 'prod-br-nativos-06',
      sku: 'NAT-NAC-60C',
      ncm: '21069030',
      title: 'NAC Acetilcisteína 60 Cápsulas - Nativos do Brasil',
      marketplace: 'Amazon BR',
      currency: 'BRL',
      unitCost: 17.57,
      salePrice: 54.90,
      imageUrl: '/images/products/nat-nac-60caps.png',
      supplierName: 'Nativos do Brasil Produtos Naturais',
      balances: {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 0,
        'WH-BR-TRANSIT-BRASPRESS': 5,
        'WH-BR-LOCAL-JPA': 0,
      },
      totalStock: 5,
      reorderPoint: 3,
    },
  ],
  movements: [
    {
      id: 'mov-init-us-01',
      timestamp: '2026-10-24T14:00:00Z',
      sku: 'HU-SIL-CABLE-FBA-2026',
      productTitle: 'HelpUS Reusable Silicone Cable Ties 20-Pack',
      type: 'INBOUND_IMPORT',
      fromWarehouse: 'WH-USA-PREP',
      toWarehouse: 'WH-USA-FBA-RYY2',
      quantity: 50,
      unitCost: 1.25,
      documentRef: 'Commercial Invoice S-215 / FBA Shipment RYY2',
      notes: 'Etiquetado FNSKU na Prep Ninjas e despachado via UPS Ground para Amazon RYY2.',
    },
    {
      id: 'mov-init-br-01',
      timestamp: '2026-10-29T14:00:00Z',
      sku: 'NAT-RESV-60CAPS',
      productTitle: 'Resveratrol Softgel 60 Caps',
      type: 'INBOUND_NFE',
      toWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
      quantity: 5,
      unitCost: 25.76,
      documentRef: 'NF-e 00002509',
      notes: 'Entrada fiscal Nativos do Brasil via Braspress (CTE-2509).',
    },
    {
      id: 'mov-init-br-02',
      timestamp: '2026-10-29T14:00:00Z',
      sku: 'NAT-MAG-TREON-60C',
      productTitle: 'Magnésio L-Treonato 60 Caps',
      type: 'INBOUND_NFE',
      toWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
      quantity: 5,
      unitCost: 15.80,
      documentRef: 'NF-e 00002509',
      notes: 'Entrada fiscal Nativos do Brasil via Braspress (CTE-2509).',
    },
    {
      id: 'mov-init-br-03',
      timestamp: '2026-10-29T14:00:00Z',
      sku: 'NAT-COQ10-VITE-60C',
      productTitle: 'Co-Q10 com Vitamina E 60 Caps',
      type: 'INBOUND_NFE',
      toWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
      quantity: 5,
      unitCost: 21.26,
      documentRef: 'NF-e 00002509',
      notes: 'Entrada fiscal Nativos do Brasil via Braspress (CTE-2509).',
    },
    {
      id: 'mov-init-br-04',
      timestamp: '2026-10-29T14:00:00Z',
      sku: 'NAT-COLAG-VITC-60C',
      productTitle: 'Colágeno Hidrolisado com Vit C 60 Caps',
      type: 'INBOUND_NFE',
      toWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
      quantity: 5,
      unitCost: 17.93,
      documentRef: 'NF-e 00002509',
      notes: 'Entrada fiscal Nativos do Brasil via Braspress (CTE-2509).',
    },
    {
      id: 'mov-init-br-05',
      timestamp: '2026-10-29T14:00:00Z',
      sku: 'NAT-6MAG-60C',
      productTitle: '6 Magnésios Quelato & Complex 60 Caps',
      type: 'INBOUND_NFE',
      toWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
      quantity: 5,
      unitCost: 18.41,
      documentRef: 'NF-e 00002509',
      notes: 'Entrada fiscal Nativos do Brasil via Braspress (CTE-2509).',
    },
    {
      id: 'mov-init-br-06',
      timestamp: '2026-10-29T14:00:00Z',
      sku: 'NAT-NAC-60C',
      productTitle: 'NAC Acetilcisteína 60 Caps',
      type: 'INBOUND_NFE',
      toWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
      quantity: 5,
      unitCost: 17.57,
      documentRef: 'NF-e 00002509',
      notes: 'Entrada fiscal Nativos do Brasil via Braspress (CTE-2509).',
    },
  ],
  invoices: [
    {
      id: 'inv-nfe-2509',
      tipo: 'NFE_BR',
      numero: '2509',
      serie: '1',
      chave: '32261047693854000164550010000025091235445528',
      dataEmissao: '2026-10-29T13:55:48-03:00',
      dataImportacao: '2026-10-29T14:30:00Z',
      fornecedorNome: 'NATIVOS DO BRASIL PRODUTOS NATURAIS LTDA',
      fornecedorDoc: '47.693.854/0001-64',
      valorTotal: 710.82,
      moeda: 'BRL',
      status: 'EM_TRANSITO',
      itensCount: 6,
      detalhesItens: [
        { sku: 'NAT-RESV-60CAPS', descricao: 'RESVERATROL SOFTGEL 60 CAPS', quantidade: 5, valorUnitario: 25.76, custoEfetivoUnitario: 31.37 },
        { sku: 'NAT-MAG-TREON-60C', descricao: 'MAGNESIO L-TREONATO 60 CAPS', quantidade: 5, valorUnitario: 15.80, custoEfetivoUnitario: 19.24 },
        { sku: 'NAT-COQ10-VITE-60C', descricao: 'CO-Q10 COM VITA E 60 CAPS', quantidade: 5, valorUnitario: 21.26, custoEfetivoUnitario: 25.89 },
        { sku: 'NAT-COLAG-VITC-60C', descricao: 'COLAGENO HIDROLISADO c/ VIT C 60 CAPS', quantidade: 5, valorUnitario: 17.93, custoEfetivoUnitario: 21.84 },
        { sku: 'NAT-6MAG-60C', descricao: '6 MAGNESIOS 60 CAPS', quantidade: 5, valorUnitario: 18.41, custoEfetivoUnitario: 22.42 },
        { sku: 'NAT-NAC-60C', descricao: 'NAC - ACETILCISTEINA 60 caps', quantidade: 5, valorUnitario: 17.57, custoEfetivoUnitario: 21.40 },
      ],
    },
    {
      id: 'inv-prep-ninjas-01',
      tipo: 'INVOICE_US',
      numero: 'B1P5U7YI-0001',
      dataEmissao: '2026-10-18T00:00:00Z',
      dataImportacao: '2026-10-20T10:00:00Z',
      fornecedorNome: 'Prep Ninjas LLC',
      fornecedorDoc: 'US-EIN-ACTIVE',
      valorTotal: 75.00,
      moeda: 'USD',
      status: 'CONCILIADA',
      itensCount: 1,
      detalhesItens: [
        { sku: 'HU-SIL-CABLE-FBA-2026', descricao: 'FNSKU Labeling & Inspection (50 un x $1.50)', quantidade: 50, valorUnitario: 1.50, custoEfetivoUnitario: 1.50 }
      ],
    }
  ],
};

export function getErpState(): ErpDatabaseState {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading database file, using default seed:', error);
  }

  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_DATABASE_STATE, null, 2), 'utf-8');
  return INITIAL_DATABASE_STATE;
}

export function saveErpState(state: ErpDatabaseState): void {
  try {
    state.lastUpdated = new Date().toISOString();
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database file:', error);
  }
}

export function registerNfeInbound(nfe: NfeData): { success: boolean; invoiceId: string; message: string } {
  const state = getErpState();

  const existing = state.invoices.find((inv) => inv.chave === nfe.chaveAcesso);
  if (existing) {
    return {
      success: false,
      invoiceId: existing.id,
      message: `A NF-e Nº ${nfe.numeroNF} (Chave: ${nfe.chaveAcesso}) já foi importada anteriormente.`,
    };
  }

  const invoiceId = `inv-nfe-${nfe.numeroNF}-${Date.now()}`;
  const now = new Date().toISOString();

  const detalhesItens = nfe.itens.map((item) => {
    let sku = `NAT-${item.cProd}`;
    if (item.xProd.toUpperCase().includes('RESVERATROL')) sku = 'NAT-RESV-60CAPS';
    else if (item.xProd.toUpperCase().includes('TREONATO')) sku = 'NAT-MAG-TREON-60C';
    else if (item.xProd.toUpperCase().includes('CO-Q10') || item.xProd.toUpperCase().includes('CQ10')) sku = 'NAT-COQ10-VITE-60C';
    else if (item.xProd.toUpperCase().includes('COLAGENO')) sku = 'NAT-COLAG-VITC-60C';
    else if (item.xProd.toUpperCase().includes('6 MAGNESIOS')) sku = 'NAT-6MAG-60C';
    else if (item.xProd.toUpperCase().includes('ACETILCISTEINA') || item.xProd.toUpperCase().includes('NAC')) sku = 'NAT-NAC-60C';

    let product = state.items.find((p) => p.sku === sku);

    if (product) {
      product.balances['WH-BR-TRANSIT-BRASPRESS'] = (product.balances['WH-BR-TRANSIT-BRASPRESS'] || 0) + item.qCom;
      product.totalStock = Object.values(product.balances).reduce((a, b) => a + b, 0);
      product.unitCost = item.vUnCom;
    } else {
      product = {
        id: `prod-br-${sku.toLowerCase()}`,
        sku,
        ncm: item.NCM,
        title: item.xProd,
        marketplace: 'Amazon BR',
        currency: 'BRL',
        unitCost: item.vUnCom,
        salePrice: parseFloat((item.effectiveUnitCost * 2.5).toFixed(2)),
        imageUrl: '/images/products/nat-resv-60caps.png',
        supplierName: nfe.emitente.razaoSocial,
        balances: {
          'WH-USA-PREP': 0,
          'WH-USA-FBA-RYY2': 0,
          'WH-BR-TRANSIT-BRASPRESS': item.qCom,
          'WH-BR-LOCAL-JPA': 0,
        },
        totalStock: item.qCom,
        reorderPoint: 3,
      };
      state.items.push(product);
    }

    state.movements.unshift({
      id: `mov-nfe-${Date.now()}-${item.itemNum}`,
      timestamp: now,
      sku,
      productTitle: item.xProd,
      type: 'INBOUND_NFE',
      toWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
      quantity: item.qCom,
      unitCost: item.vUnCom,
      documentRef: `NF-e ${nfe.numeroNF}`,
      notes: `Importado via XML da SEFAZ emitido por ${nfe.emitente.nomeFantasia || nfe.emitente.razaoSocial}`,
    });

    return {
      sku,
      descricao: item.xProd,
      quantidade: item.qCom,
      valorUnitario: item.vUnCom,
      custoEfetivoUnitario: item.effectiveUnitCost,
    };
  });

  const newInvoice: StoredInvoice = {
    id: invoiceId,
    tipo: 'NFE_BR',
    numero: nfe.numeroNF,
    serie: nfe.serie,
    chave: nfe.chaveAcesso,
    dataEmissao: nfe.dataEmissao,
    dataImportacao: now,
    fornecedorNome: nfe.emitente.razaoSocial,
    fornecedorDoc: nfe.emitente.cnpj,
    valorTotal: nfe.totais.valorNota,
    moeda: 'BRL',
    status: 'EM_TRANSITO',
    itensCount: nfe.itens.length,
    detalhesItens,
  };

  state.invoices.unshift(newInvoice);
  saveErpState(state);

  return {
    success: true,
    invoiceId,
    message: `NF-e Nº ${nfe.numeroNF} processada com sucesso! ${nfe.itens.length} produtos adicionados ao estoque em trânsito da Braspress.`,
  };
}

export function transferInventory(
  sku: string,
  fromWarehouse: WarehouseCode,
  toWarehouse: WarehouseCode,
  quantity: number,
  notes?: string
): { success: boolean; message: string } {
  const state = getErpState();
  const product = state.items.find((p) => p.sku === sku);

  if (!product) {
    return { success: false, message: `Produto SKU ${sku} não encontrado.` };
  }

  const currentFromBalance = product.balances[fromWarehouse] || 0;
  if (currentFromBalance < quantity) {
    return {
      success: false,
      message: `Saldo insuficiente em ${WAREHOUSES[fromWarehouse].name}. Disponível: ${currentFromBalance}, solicitado: ${quantity}.`,
    };
  }

  product.balances[fromWarehouse] -= quantity;
  product.balances[toWarehouse] = (product.balances[toWarehouse] || 0) + quantity;
  product.totalStock = Object.values(product.balances).reduce((a, b) => a + b, 0);

  state.movements.unshift({
    id: `mov-transf-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sku,
    productTitle: product.title,
    type: 'TRANSFER',
    fromWarehouse,
    toWarehouse,
    quantity,
    unitCost: product.unitCost,
    notes: notes || `Transferência de estoque entre armazéns ${fromWarehouse} -> ${toWarehouse}`,
  });

  saveErpState(state);
  return {
    success: true,
    message: `${quantity} unidades de ${product.title} transferidas com sucesso para ${WAREHOUSES[toWarehouse].name}.`,
  };
}
