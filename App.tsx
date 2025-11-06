
import React, { useState, useMemo, useEffect, useRef } from 'react';

type RowData = Record<string, string>;

const HighlightedText: React.FC<{ text: string | undefined; highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim() || !text) {
        return <>{text}</>;
    }
    // Escape special characters in highlight string for regex
    const escapedHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    if (!escapedHighlight) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) => {
                if (part.toLowerCase() === highlight.toLowerCase()) {
                    return (
                        <mark key={i} className="bg-violet-100 dark:bg-violet-500/30 rounded-sm px-0.5">
                            {part}
                        </mark>
                    );
                }
                return part;
            })}
        </>
    );
};


// --- CONFIGURATION ---
const SEARCHABLE_COLUMNS = ['작품명/지문명']; 
const FILTERABLE_COLUMNS = ['수록교재', '대단원', '중단원'];

const DISPLAY_COLUMNS = [
    { header: '작품명/지문명' },
    { header: '수록교재' },
    { header: '대단원' },
    { header: '중단원' },
]; 
// --- END OF CONFIGURATION ---


const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-8 h-64">
        <svg className="animate-spin h-8 w-8 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">잠시만 기다려주세요.</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg m-6" role="alert">
        <strong className="font-bold">일시적인 오류가 발생했어요. 페이지를 새로고침 해주세요.: </strong>
        <span className="block sm:inline">{message}</span>
    </div>
);

const AppHeader: React.FC = () => (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <img 
              className="h-6 w-auto" 
              src="https://i.ibb.co/pj04WY4T/image.png" 
              alt="Logo" 
            />
          </div>
           <div className="flex items-center">
              <a href="https://expert.solvook.com/handouts" target="_blank" rel="noopener noreferrer" 
                 className="bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-500/30 text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 transition-colors">
                 엑스퍼트로 돌아가기
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
           </div>
        </div>
      </nav>
    </header>
);

const PaginationControls: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxPagesToShow = 5;
        const halfPages = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        let startPage = Math.max(1, currentPage - halfPages);
        let endPage = Math.min(totalPages, currentPage + halfPages);

        if (currentPage - 1 <= halfPages) {
            endPage = maxPagesToShow;
        }
        
        if (totalPages - currentPage <= halfPages) {
            startPage = totalPages - maxPagesToShow + 1;
        }

        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) pages.push('...');
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };
    
    return (
        <nav aria-label="Pagination" className="flex justify-center items-center mt-6 space-x-2 text-sm">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                aria-label="Previous Page"
            >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) =>
                    typeof page === 'number' ? (
                        <button
                            key={`page-${page}`}
                            onClick={() => onPageChange(page)}
                            aria-current={currentPage === page ? 'page' : undefined}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                                currentPage === page
                                    ? 'font-semibold bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                            }`}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400">
                            ...
                        </span>
                    )
                )}
            </div>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                aria-label="Next Page"
            >
                 <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                 </svg>
            </button>
        </nav>
    );
};


const App: React.FC = () => {
    const [data, setData] = useState<RowData[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const isInitialMount = useRef(true);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        const publishedCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRndZy_puUxHDNiMvPG4kZsJlN6C-oZwMvtF9TcvW-iEeZD-PY-oSMK11f3A8-R5P10Mq70LSapm9Hj/pub?output=csv';

        const fetchData = async () => {
            if (isInitialMount.current) setIsLoading(true);
            setError(null);
            
            try {
                const response = await fetch(`${publishedCsvUrl}&t=${new Date().getTime()}`);
                if (!response.ok) throw new Error(`데이터를 가져오는 데 실패했습니다. (상태: ${response.status})`);

                const csvText = await response.text();
                const lines = csvText.trim().split(/\r?\n/);

                if (lines.length < 2) {
                    setData([]);
                    if(isInitialMount.current) setError("시트가 비어 있거나 헤더 행만 포함되어 있습니다.");
                } else {
                    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                    const newRows = lines.slice(1).map((line: string) => {
                        // Regex to split by comma but ignore commas inside double quotes
                        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                        return headers.reduce((obj, header, index) => {
                            const value = values[index] || '';
                            // Trim, remove surrounding quotes, and unescape double quotes
                            obj[header] = value.trim().replace(/^"|"$/g, '').replace(/""/g, '"');
                            return obj;
                        }, {} as RowData);
                    });
                    setData(newRows);
                }
                setLastUpdated(new Date());

            } catch (err: any) {
                console.error(err);
                setError(err.message || '예기치 않은 오류가 발생했습니다.');
            } finally {
                if (isInitialMount.current) {
                    setIsLoading(false);
                    isInitialMount.current = false;
                }
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 30000); 

        return () => clearInterval(intervalId);
    }, []);

    const filterOptions = useMemo(() => {
        const options: Record<string, string[]> = {};
        FILTERABLE_COLUMNS.forEach(col => {
            const uniqueValues = [...new Set(data.map(row => row[col]).filter(Boolean))];
            options[col] = uniqueValues.sort((a, b) => a.localeCompare(b));
        });
        return options;
    }, [data]);

    const handleFilterChange = (column: string, value: string) => {
        setFilters(prev => ({ ...prev, [column]: value }));
    };

    const filteredData = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        
        const results = data.filter(row => {
            // Apply filters first
            const filterMatch = FILTERABLE_COLUMNS.every(col => {
                const filterValue = filters[col];
                return !filterValue || row[col] === filterValue;
            });
            if (!filterMatch) return false;

            // Then apply search term
            if (!searchTerm) return true;
            return SEARCHABLE_COLUMNS.some(col =>
                row[col] && String(row[col]).toLowerCase().includes(lowercasedTerm)
            );
        });

        return [...results].sort((a, b) => {
            const sortKey = DISPLAY_COLUMNS[0].header;
            const valA = a[sortKey] || '';
            const valB = b[sortKey] || '';
            return valA.localeCompare(valB);
        });
    }, [data, searchTerm, filters]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);
    
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <AppHeader />
        
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">국어 작품/지문 수록교재 찾기</h1>
                <p className="mt-2 text-md sm:text-lg text-slate-600 dark:text-slate-400">찾고 있는 작품이 수록된 교재를 빠르게 찾아보세요!</p>
            </div>

            <div className="mb-6">
                <div className="relative max-w-3xl mx-auto">
                   <input
                     type="text"
                     placeholder="찾고 있는 작품명/지문명을 입력하세요."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-5 pr-12 py-3 text-base border border-slate-300 dark:border-slate-700 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow shadow-sm"
                     aria-label="Search data"
                   />
                   <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400 dark:text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                   </div>
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                    {FILTERABLE_COLUMNS.map(col => {
                        const label = col;
                        return (
                            <div key={col} className="relative w-full sm:w-52">
                                <label htmlFor={`filter-${col}`} className="sr-only">{label}</label>
                                <select
                                    id={`filter-${col}`}
                                    value={filters[col] || ''}
                                    onChange={(e) => handleFilterChange(col, e.target.value)}
                                    className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 py-2 pl-3 pr-8 transition shadow-sm appearance-none"
                                >
                                    <option value="">{label}</option>
                                    {filterOptions[col]?.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {lastUpdated && (
              <p className="text-xs text-right text-slate-500 dark:text-slate-400 -mt-4 mb-4 pr-1">
                마지막 업데이트: {lastUpdated.toLocaleTimeString()}
              </p>
            )}

            <div className="mt-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    {isLoading ? <LoadingSpinner /> : error ? <ErrorDisplay message={error} /> : (
                         <div>
                            {filteredData.length > 0 ? (
                                <div>
                                    {/* Table Header */}
                                    <div className="hidden sm:grid grid-cols-12 gap-4 px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                        <div className="col-span-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{DISPLAY_COLUMNS[0].header}</div>
                                        <div className="col-span-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{DISPLAY_COLUMNS[1].header}</div>
                                        <div className="col-span-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{DISPLAY_COLUMNS[2].header}</div>
                                        <div className="col-span-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{DISPLAY_COLUMNS[3].header}</div>
                                        <div className="col-span-2"></div>
                                    </div>
                                    
                                    {/* Table Body */}
                                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {paginatedData.map((row, rowIndex) => (
                                            <div key={rowIndex} className="grid grid-cols-12 gap-x-4 gap-y-2 items-center p-4 sm:px-5 sm:py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                                                <div className="col-span-12 sm:col-span-4 font-medium text-slate-900 dark:text-slate-50">
                                                    <HighlightedText text={row[DISPLAY_COLUMNS[0].header]} highlight={searchTerm} />
                                                </div>

                                                <div className="col-span-12 sm:col-span-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="sm:hidden font-semibold text-slate-500">{DISPLAY_COLUMNS[1].header}: </span>
                                                    {row[DISPLAY_COLUMNS[1].header]}
                                                </div>

                                                <div className="col-span-12 sm:col-span-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="sm:hidden font-semibold text-slate-500">{DISPLAY_COLUMNS[2].header}: </span>
                                                    {row[DISPLAY_COLUMNS[2].header]}
                                                </div>
                                                
                                                <div className="col-span-12 sm:col-span-2 text-sm text-slate-600 dark:text-slate-400">
                                                     <span className="sm:hidden font-semibold text-slate-500">{DISPLAY_COLUMNS[3].header}: </span>
                                                    {row[DISPLAY_COLUMNS[3].header]}
                                                </div>
                                                
                                                <div className="col-span-12 sm:col-span-2 text-left sm:text-right mt-2 sm:mt-0">
                                                    <a
                                                        href="https://expert.solvook.com/handouts"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block text-sm font-medium text-violet-700 bg-white dark:text-violet-300 dark:bg-slate-700 border border-violet-300 dark:border-violet-500 rounded-md px-4 py-2 whitespace-nowrap hover:bg-violet-50 dark:hover:bg-slate-600 transition-colors">
                                                        변형문제 만들러 가기
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             ) : (
                                <div className="text-center py-16 px-6">
                                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" strokeWidth="1">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    </svg>
                                    <h3 className="mt-4 text-md font-semibold text-slate-800 dark:text-white">
                                       {searchTerm || Object.values(filters).some(v => v) ? "검색 결과가 없습니다" : "표시할 데이터가 없습니다"}
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                       {searchTerm || Object.values(filters).some(v => v) ? "다른 검색어나 필터를 사용해 보세요." : "스프레드시트가 비어있을 수 있습니다."}
                                     </p>
                                </div>
                            )}
                        </div>
                      )}
                </div>
                 {totalPages > 1 && (
                    <div className="py-4">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
      </div>
    );
};

export default App;
