export interface BookFormat {
  format: 'Kindle eBook' | 'Paperback' | 'Hardcover';
  dimensions?: string;
  pages: number;
  priceUSD: number;
  priceBRL: number;
  printCostUSD: number;
  royaltyRate: number; // e.g. 0.70 or 0.60
  royaltyUSD: number;
  royaltyBRL: number;
  fileStatus: 'Ready' | 'Uploaded' | 'In Pre-flight';
  packageArtifact: string;
}

export interface BookItem {
  id: string;
  asinOrIsbn?: string;
  title: string;
  subtitle: string;
  author: string;
  authorPhotoUrl?: string;
  authorBio: string;
  category: string;
  targetAudience: string;
  languages: string[];
  coverImageUrl: string;
  synopsis: string;
  highlights: string[];
  formats: BookFormat[];
  marketplaces: string[];
  kdpStatus: 'Live on Amazon' | 'Ready for KDP Upload' | 'Editorial Approved';
  economicsModel: 'Print-on-Demand (POD)' | 'Direct Digital (KDP)';
  portalUrl?: string;
  isbn13?: string;
}

export const MOCK_BOOKS: BookItem[] = [
  {
    id: 'book-the-map-of-borrowed-steps',
    asinOrIsbn: 'B0-MAP-LILTWATER-2026',
    title: 'The Map of Borrowed Steps',
    subtitle: 'Book One of the Liltwater Chronicles — A Progression Fantasy Novel',
    author: 'Wagner Medeiros dos Santos',
    authorPhotoUrl: '/images/books/autor_wagner_medeiros.png',
    authorBio: 'Pesquisador, autor e arquiteto de sistemas, criador da saga Liltwater Chronicles e dos modelos de análise soberana HelpUS.',
    category: 'Fiction / Fantasy / LitRPG & Progression',
    targetAudience: 'Leitores globais de fantasia épica, LitRPG e progressão de personagens (14+ anos).',
    languages: ['EN-US (Original)'],
    coverImageUrl: '/images/books/the_map_of_borrowed_steps.jpg',
    synopsis: 'Nas margens esquecidas de Liltwater, onde a magia se entrelaça com leis antigas e passos emprestados cobram um preço implacável, um jovem descobre que cada habilidade tem uma dívida oculta. Um romance empolgante com ilustrações exclusivas a cores e sistema mágico estruturado.',
    highlights: [
      'Miolo color ilustrado 170 páginas com design tipográfico premium (Big 5 standards).',
      'Edição Kindle otimizada para Paperwhite, Oasis e app mobile com navegação por capítulos.',
      'Capa wrap completa para Paperback 6x9 e Hardcover Case Laminate de luxo.',
      'Áudio e TTS (Text-to-Speech) habilitados para leitura assistida na Amazon.',
    ],
    formats: [
      {
        format: 'Kindle eBook',
        pages: 170,
        priceUSD: 4.99,
        priceBRL: 24.90,
        printCostUSD: 0.00,
        royaltyRate: 0.70,
        royaltyUSD: 3.49,
        royaltyBRL: 17.43,
        fileStatus: 'Ready',
        packageArtifact: '06_LIVRO_ILUSTRADO_COLOR_KINDLE.epub (6 MB)',
      },
      {
        format: 'Paperback',
        dimensions: '6" x 9" (15.24 x 22.86 cm)',
        pages: 170,
        priceUSD: 14.99,
        priceBRL: 64.90,
        printCostUSD: 4.85,
        royaltyRate: 0.60,
        royaltyUSD: 4.14,
        royaltyBRL: 21.50,
        fileStatus: 'Ready',
        packageArtifact: '05_LIVRO_ILUSTRADO_COLOR_6x9_IMPRESSAO.pdf (74 MB)',
      },
      {
        format: 'Hardcover',
        dimensions: '6" x 9" Case Laminate',
        pages: 170,
        priceUSD: 24.99,
        priceBRL: 99.90,
        printCostUSD: 8.10,
        royaltyRate: 0.60,
        royaltyUSD: 6.89,
        royaltyBRL: 36.40,
        fileStatus: 'Ready',
        packageArtifact: '12_CAPA_COMPLETA_WRAP_HARDCOVER_6x9_170P.pdf',
      },
    ],
    marketplaces: ['Amazon.com (US)', 'Amazon.com.br (BR)', 'Amazon.co.uk (UK)', 'Amazon.de (DE)', 'Amazon.co.jp (JP)'],
    kdpStatus: 'Ready for KDP Upload',
    economicsModel: 'Print-on-Demand (POD)',
    portalUrl: 'https://books.helpusbr.com',
  },
  {
    id: 'book-cvss-v4-sovereign',
    asinOrIsbn: '978-65-00-CVSS4-SOV',
    title: 'CVSS v4.0 Sovereign Edition',
    subtitle: 'The Definitive Architecture, Benchmark & Scoring Manual for Cybersecurity Leaders',
    author: 'Wagner Medeiros dos Santos',
    authorPhotoUrl: '/images/books/autor_wagner_medeiros.png',
    authorBio: 'Engenheiro de cibersegurança e pesquisador pioneiro em benchmarks de inteligência artificial aplicados à taxonomia CVSS v4.0.',
    category: 'Computer Science / Cybersecurity / Vulnerability Management',
    targetAudience: 'CISOs, Engenheiros de Segurança, Auditores, Equipes de Red/Blue Team e Pesquisadores de Ciberdefesa.',
    languages: ['EN-US (Academic & Industry)'],
    coverImageUrl: '/images/books/cvss_v4_sovereign.jpg',
    synopsis: 'A obra mais completa sobre o novo padrão global Common Vulnerability Scoring System versão 4.0. Contém 392 páginas com dissecção vetorial completa, matriz de transição v3.1 para v4.0, benchmark empírico comparando analistas humanos versus agentes autônomos de IA, e código-fonte validado.',
    highlights: [
      '392 páginas de conteúdo técnico rigoroso com mais de 70 diagramas vetoriais e gráficos.',
      'Pacote Kindle Create (.kpf) e PDF para impressão em alta resolução 300 DPI.',
      'Paperback 6x9 profissional e Hardcover definitivo para bibliotecas e centros de pesquisa.',
      'Artigo científico correspondente submetido ao IEEE S&P 2027.',
    ],
    formats: [
      {
        format: 'Kindle eBook',
        pages: 392,
        priceUSD: 19.99,
        priceBRL: 89.90,
        printCostUSD: 0.00,
        royaltyRate: 0.70,
        royaltyUSD: 13.99,
        royaltyBRL: 62.93,
        fileStatus: 'Ready',
        packageArtifact: 'PDF_PARA_IMPORTAR_NO_KINDLE_CREATE.kpf (4 MB)',
      },
      {
        format: 'Paperback',
        dimensions: '6" x 9" (15.24 x 22.86 cm)',
        pages: 392,
        priceUSD: 39.99,
        priceBRL: 169.90,
        printCostUSD: 7.20,
        royaltyRate: 0.60,
        royaltyUSD: 16.79,
        royaltyBRL: 74.50,
        fileStatus: 'Ready',
        packageArtifact: 'MIOLO_392_PAGINAS_FINAL.pdf (4.8 MB)',
      },
      {
        format: 'Hardcover',
        dimensions: '6" x 9" Hardcover Cloth/Laminate',
        pages: 392,
        priceUSD: 59.99,
        priceBRL: 249.90,
        printCostUSD: 11.50,
        royaltyRate: 0.60,
        royaltyUSD: 24.49,
        royaltyBRL: 112.00,
        fileStatus: 'Ready',
        packageArtifact: 'CAPA_COMPLETA_V2_IMPRESSAO.pdf',
      },
    ],
    marketplaces: ['Amazon.com (US)', 'Amazon.com.br (BR)', 'Amazon.co.uk (UK)', 'Amazon.de (DE)', 'Amazon.co.jp (JP)'],
    kdpStatus: 'Ready for KDP Upload',
    economicsModel: 'Print-on-Demand (POD)',
    portalUrl: 'https://cvss.helpusbr.com',
  },
  {
    id: 'book-little-explorers-96p',
    asinOrIsbn: 'HU-KDP-LITTLE-EXP-96P',
    title: 'Little Explorers — 96 Pages',
    subtitle: 'Animal Tracing, Mazes & Handwriting Early Learning Activity Workbook',
    author: 'HelpUS Editorial & Wagner Medeiros',
    authorPhotoUrl: '/images/books/autor_wagner_medeiros.png',
    authorBio: 'Linha editorial HelpUS focada em materiais de apoio pedagógico, caligrafia motora e atividades lúdicas infantis.',
    category: 'Children’s Activity Books / Early Childhood Education / Handwriting',
    targetAudience: 'Crianças de 3 a 6 anos, pais, educadores infantis e escolas bilíngues.',
    languages: ['PT-BR (Brasil)', 'EN-US (Global)', 'ES-ES (Espanhol)'],
    coverImageUrl: '/images/books/little_explorers_96p.jpg',
    synopsis: 'Caderno de atividades completo com 96 páginas em formato grande 8.5" x 11". Combina treino de traçado pontilhado de letras e números com 26 animais nativos, labirintos vetoriais matematicamente gerados, jogos de sombras e desafios lúdicos.',
    highlights: [
      '96 páginas de atividades progressivas geradas por motor vetorial proprietário (Python ReportLab).',
      'Ilustrações de animais nativos em 300 DPI (arara, borboleta, dinossauro, elefante, leão...).',
      'Formatos independentes em Português, Inglês e Espanhol para venda multi-marketplace.',
      'Capa laminada brilhante de alta durabilidade com guias de pre-flight aprovados.',
    ],
    formats: [
      {
        format: 'Paperback',
        dimensions: '8.5" x 11" (21.59 x 27.94 cm)',
        pages: 96,
        priceUSD: 8.99,
        priceBRL: 36.90,
        printCostUSD: 2.15,
        royaltyRate: 0.60,
        royaltyUSD: 3.24,
        royaltyBRL: 14.80,
        fileStatus: 'Ready',
        packageArtifact: 'Little_Explorers_96_PAGE_INTERIOR_F844.pdf (2.2 MB)',
      },
    ],
    marketplaces: ['Amazon.com (US)', 'Amazon.com.br (BR)', 'Amazon.es (ES)', 'Amazon.co.uk (UK)'],
    kdpStatus: 'Editorial Approved',
    economicsModel: 'Print-on-Demand (POD)',
    portalUrl: 'https://books.helpusbr.com',
  },
];
