import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SlidersHorizontal, Search as SearchIcon } from "lucide-react";

export interface FilterOption {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

interface SearchFiltersProps {
  placeholder?: string;
  filters: FilterOption[];
  onSearch: (query: string) => void;
  onFilterChange: (filterId: string, value: string) => void;
  children?: ReactNode;
}

export function SearchFilters({
  placeholder = "Search...",
  filters,
  onSearch,
  onFilterChange,
  children,
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-8"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="grid gap-2">
                {filters.map((filter) => (
                  <div key={filter.id} className="grid gap-1">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {filter.label}
                    </label>
                    <Select onValueChange={(value) => onFilterChange(filter.id, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${filter.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {children}
    </div>
  );
}
