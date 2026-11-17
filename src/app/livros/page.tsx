'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MOCK_BOOKS, BookItem, BookFormat } from '@/data/mockBooks';
import {
  BookOpen,
  DollarSign,
  Globe2,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Shield,
  Layers,
  ArrowUpRight,
  Info,
  Award,
  ChevronRight,
  FileCheck,
  Printer
} from 'lucide-react';

export default function LivrosPage() {
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<BookFormat | null>(null);

  return (
    <div className="space-y-8 select-none">
      {/* Top Hero Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-900 border border-purple-900/40 rounded-3xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-3 py-1 rounded-full font-mono font-medium flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Amazon KDP & Editorial HelpUS
          </span>
          <span className="text-xs text-slate-400 font-mono">• Print-on-Demand (POD) & Kindle Digital</span>
        </div>

        <div className="space-y-2 max-w-3xl">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Catálogo Editorial & Livros Amazon KDP
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Gestão estratégica de publicações globais na Amazon. Diferente do FBA tradicional de produtos físicos, a vertical de livros KDP opera sob o modelo <strong>Print-on-Demand (POD)</strong> e e-books digitais: <strong>custo zero de estoque imobilizado</strong>, ausência de taxas de armazenagem mensal e margens de <strong>60% a 70% de royalties líquidos</strong> em dólares e reais.
          </p>
        </div>

        {/* Global Markets Badges */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
          <span className="text-slate-400">Distribuição Ativa:</span>
          <span className="px-2 py-0.5 bg-slate-800/80 border border-slate-700 rounded-lg">🇺🇸 Amazon.com (EUA)</span>
          <span className="px-2 py-0.5 bg-slate-800/80 border border-slate-700 rounded-lg">🇧🇷 Amazon.com.br</span>
          <span className="px-2 py-0.5 bg-slate-800/80 border border-slate-700 rounded-lg">🇬🇧 Amazon.co.uk</span>
          <span className="px-2 py-0.5 bg-slate-800/80 border border-slate-700 rounded-lg">🇩🇪 Amazon.de</span>
          <span className="px-2 py-0.5 bg-slate-800/80 border border-slate-700 rounded-lg">🇯🇵 Amazon.co.jp</span>
        </div>
      </div>

      {/* KPI Cards: Editorial & Unit Economics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
        <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-slate-400 text-xs block font-sans">Obras no Portfólio</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">
            {MOCK_BOOKS.length} Títulos
          </div>
          <div className="text-[11px] text-slate-400">Ficção, Cibersegurança & Infantil</div>
        </div>

        <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-slate-400 text-xs block font-sans">Formatos Publicáveis</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">
            7 Edições
          </div>
          <div className="text-[11px] text-slate-400">Kindle + Paperback + Hardcover</div>
        </div>

        <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-slate-400 text-xs block font-sans">Margem de Royalty (Digital)</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            70% Líquido
          </div>
          <div className="text-[11px] text-emerald-500">Sem taxa de envio / Armazenagem $0</div>
        </div>

        <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-slate-400 text-xs block font-sans">Margem Royalty (Impresso)</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            60% Líquido
          </div>
          <div className="text-[11px] text-emerald-500">Impressão sob demanda pela Amazon</div>
        </div>
      </div>

      {/* POD vs Physical FBA Comparative Matrix */}
      <div className="p-5 sm:p-6 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Matriz Comparativa: Amazon FBA (Físico) vs. Amazon KDP (Editorial)</span>
          </h2>
          <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
            Sinergia de Ecossistema
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Parâmetro de Negócio</th>
                <th className="pb-3 font-semibold text-blue-400">Amazon FBA Físico (Ex: Cabos / Suplementos)</th>
                <th className="pb-3 font-semibold text-purple-400">Amazon KDP Editorial (Livros & E-books)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 font-bold text-white font-sans">Estoque Inicial Requerido</td>
                <td className="py-2.5 text-slate-400">Compra antecipada obrigatória (30 a 50+ unidades)</td>
                <td className="py-2.5 text-emerald-400 font-bold">Zero (Impresso sob demanda somente após o pedido do leitor)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white font-sans">Custo de Armazenagem Mensal</td>
                <td className="py-2.5 text-amber-400">$0.87 a $2.40 / pé cúbico (Penalidades por estoque parado)</td>
                <td className="py-2.5 text-emerald-400 font-bold">$0.00 permanente (Infraestrutura KDP nativa)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white font-sans">Margem Líquida / Royalties</td>
                <td className="py-2.5 text-slate-300">25% a 40% (após FBA Fee, Prep, Frete Inbound)</td>
                <td className="py-2.5 text-emerald-400 font-bold">60% (Físico) a 70% (Kindle Digital)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white font-sans">Abrangência Geográfica</td>
                <td className="py-2.5 text-slate-300">Limitada ao CD regional de envio (ex: RYY2 Georgia / Cajamar SP)</td>
                <td className="py-2.5 text-indigo-400">Global simultânea (EUA, Brasil, Reino Unido, Europa, Japão)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white font-sans">Risco de Perda / Avaria</td>
                <td className="py-2.5 text-amber-400">Risco do vendedor em trânsito ou no armazém</td>
                <td className="py-2.5 text-emerald-400 font-bold">Assumido 100% pela gráfica integrada da Amazon</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Books Showcase */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Obras no Catálogo Amazon HelpUS</span>
          </h2>
          <p className="text-xs text-slate-400">
            Arquivos de miolo, capas wrap 300 DPI, pre-flights e edições digitais validados e prontos para publicação
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {MOCK_BOOKS.map((book) => (
            <div
              key={book.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-6 flex flex-col justify-between space-y-5 transition shadow-xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition pointer-events-none"></div>

              {/* Book Header with Cover and Metadata */}
              <div className="space-y-4">
                <div className="relative aspect-[3/4] w-full max-h-72 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                  <Image
                    src={book.coverImageUrl}
                    alt={book.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain p-2 group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-purple-600/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    {book.kdpStatus}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono text-purple-400 font-semibold uppercase tracking-wider">
                    {book.category}
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-purple-300 transition mt-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {book.subtitle}
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                  {book.authorPhotoUrl ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden relative border border-purple-500/30 flex-shrink-0">
                      <Image
                        src={book.authorPhotoUrl}
                        alt={book.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-xs font-bold text-white">
                      WM
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{book.author}</div>
                    <div className="text-[10px] text-slate-400 truncate">{book.targetAudience}</div>
                  </div>
                </div>

                {/* Formats Grid */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Formatos & Royalties</span>
                  <div className="space-y-1">
                    {book.formats.map((fmt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800/80 rounded-lg text-xs font-mono transition cursor-pointer"
                        onClick={() => {
                          setSelectedBook(book);
                          setSelectedFormat(fmt);
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-white font-medium">{fmt.format}</span>
                          {fmt.dimensions && (
                            <span className="text-[10px] text-slate-500">({fmt.dimensions})</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-400 font-bold">${fmt.priceUSD.toFixed(2)}</span>
                          <span className="text-slate-500 text-[10px] ml-1.5">(Royalty +${fmt.royaltyUSD.toFixed(2)})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setSelectedBook(book);
                    setSelectedFormat(book.formats[0]);
                  }}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/30"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Ver Detalhes do Livro & Ficha</span>
                </button>

                {book.portalUrl && (
                  <a
                    href={book.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-mono transition flex items-center justify-center gap-1.5"
                  >
                    <span>Acessar Portal Web Dedicado</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Author Section */}
      <div className="p-6 sm:p-8 bg-slate-900/80 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-xl flex-shrink-0">
          <Image
            src="/images/books/autor_wagner_medeiros.png"
            alt="Wagner Medeiros dos Santos"
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs font-mono text-purple-400">
            <Award className="w-3.5 h-3.5" />
            Autor Independente & Arquiteto Soberano
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Wagner Medeiros dos Santos
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Autor das obras publicadas via Amazon KDP Global, combinando rigor técnico e pesquisa de ponta (como a monografia pioneira sobre CVSS v4.0 e benchmarks de IA), literatura de ficção e fantasia LitRPG com ilustrações dedicadas, e publicações educativas motoras para a primeira infância. Todos os direitos e propriedade intelectual são de custódia soberana HelpUS.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-slate-400 justify-center md:justify-start">
            <span className="flex items-center gap-1 text-purple-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              KDP Author Central Registrado
            </span>
            <span className="flex items-center gap-1 text-purple-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              ISBNs e Fichas Catalográficas
            </span>
            <span className="flex items-center gap-1 text-purple-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              Distribuição Global sem Intermediários
            </span>
          </div>
        </div>
      </div>

      {/* Modal: Book Full Details & Preflight Package */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                  {selectedBook.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {selectedBook.title}
                </h3>
                <p className="text-xs text-slate-400">{selectedBook.subtitle}</p>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition"
              >
                ✕
              </button>
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-slate-300">
                Sinopse da Obra
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                {selectedBook.synopsis}
              </p>
            </div>

            {/* Highlights */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-slate-300">
                Destaques Editoriais & Técnicos
              </h4>
              <div className="space-y-1.5">
                {selectedBook.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300 font-sans">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formats Economics Detail */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-slate-300">
                Economia por Formato Publicado
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedBook.formats.map((fmt, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{fmt.format}</span>
                      <span className="text-[10px] text-purple-400">{(fmt.royaltyRate * 100).toFixed(0)}% Roy</span>
                    </div>
                    <div className="text-lg font-extrabold text-emerald-400">
                      ${fmt.priceUSD.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-900">
                      <div>R$ {fmt.priceBRL.toFixed(2)} BRL</div>
                      {fmt.printCostUSD > 0 && (
                        <div>Custo Impressão: ${fmt.printCostUSD.toFixed(2)}</div>
                      )}
                      <div className="text-emerald-400 font-bold">
                        Lucro Líquido: +${fmt.royaltyUSD.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate" title={fmt.packageArtifact}>
                      Arquivo: {fmt.packageArtifact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
