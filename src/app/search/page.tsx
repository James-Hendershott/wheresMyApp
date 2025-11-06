// WHY: Users need a dedicated search page to find items/containers/locations quickly
// WHAT: Client-side search interface with real-time results and categorized display
// HOW: Uses globalSearch server action, debounced input, displays results by category

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Package, Box, MapPin, ArrowRight } from "lucide-react";
import { globalSearch, SearchResults } from "@/app/actions/searchActions";
import { useDebounce } from "@/hooks/useDebounce";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResults>({
    containers: [],
    items: [],
    locations: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.length < 2) {
        setResults({ containers: [], items: [], locations: [] });
        return;
      }

      setIsSearching(true);
      try {
        const searchResults = await globalSearch(debouncedQuery);
        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedQuery]);

  const totalResults =
    results.containers.length + results.items.length + results.locations.length;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Search Inventory</h1>
        <p className="text-gray-600">
          Search across all containers, items, and locations
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, code, description..."
          className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="text-center text-gray-500">Searching...</div>
      )}

      {/* No Query */}
      {!query && (
        <div className="text-center text-gray-500">
          <Search className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <p>Start typing to search your inventory</p>
        </div>
      )}

      {/* No Results */}
      {query.length >= 2 && !isSearching && totalResults === 0 && (
        <div className="text-center text-gray-500">
          <Box className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <p className="mb-2 text-lg font-medium">No results found</p>
          <p className="text-sm">
            Try searching with different keywords or check your spelling
          </p>
        </div>
      )}

      {/* Results */}
      {totalResults > 0 && (
        <div className="space-y-8">
          {/* Result Count */}
          <div className="text-sm text-gray-600">
            Found {totalResults} result{totalResults !== 1 ? "s" : ""}
          </div>

          {/* Containers */}
          {results.containers.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Package className="h-5 w-5" />
                Containers ({results.containers.length})
              </h2>
              <div className="space-y-2">
                {results.containers.map((container) => (
                  <Link
                    key={container.id}
                    href={`/containers/${container.id}`}
                    className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-500 hover:bg-blue-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{container.label}</div>
                        <div className="text-sm text-gray-600">
                          Code: {container.code}
                          {container.type && ` • ${container.type}`}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          📍 {container.locationName}
                          {container.rackName && ` → ${container.rackName}`}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Items */}
          {results.items.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Box className="h-5 w-5" />
                Items ({results.items.length})
              </h2>
              <div className="space-y-2">
                {results.items.map((item) => (
                  <Link
                    key={item.id}
                    href={
                      item.containerId
                        ? `/containers/${item.containerId}`
                        : `/inventory`
                    }
                    className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-500 hover:bg-blue-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-600">
                            {item.description.length > 100
                              ? `${item.description.substring(0, 100)}...`
                              : item.description}
                          </div>
                        )}
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              item.status === "IN_STORAGE"
                                ? "bg-green-100 text-green-700"
                                : item.status === "CHECKED_OUT"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.status.replace("_", " ")}
                          </span>
                          {item.containerLabel && (
                            <span className="text-gray-500">
                              in {item.containerLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Locations */}
          {results.locations.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <MapPin className="h-5 w-5" />
                Locations ({results.locations.length})
              </h2>
              <div className="space-y-2">
                {results.locations.map((location) => (
                  <Link
                    key={location.id}
                    href="/locations"
                    className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-500 hover:bg-blue-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-gray-600">
                          {location.rackCount} rack
                          {location.rackCount !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
