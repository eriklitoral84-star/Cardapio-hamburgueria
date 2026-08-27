import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  resultCount?: number;
  isSearching: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  resultCount,
  isSearching,
}) => {
  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar no cardápio (ex: burger, smash, batata, coca...)"
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-xs"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            title="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isSearching && (
        <div className="mt-2 px-1 flex items-center justify-between text-xs text-slate-500">
          <span>
            Buscando por: <strong className="text-slate-800 font-semibold">"{query}"</strong>
          </span>
          <span className="font-medium bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
            {resultCount} {resultCount === 1 ? 'item encontrado' : 'itens encontrados'}
          </span>
        </div>
      )}
    </div>
  );
};
