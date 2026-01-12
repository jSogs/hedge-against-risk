import * as React from "react";
import { Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type LocationOption = { label: string; group: string };

const LOCATION_GROUPS: { heading: string; options: string[] }[] = [
  {
    heading: "Popular",
    options: [
      "United States (National)",
      "New York, NY",
      "Los Angeles, CA",
      "San Francisco, CA",
      "Chicago, IL",
      "Austin, TX",
      "London, UK",
      "Toronto, Canada",
      "Singapore",
      "Sydney, Australia",
    ],
  },
  {
    heading: "United States (Major metros)",
    options: [
      "New York, NY",
      "Los Angeles, CA",
      "Chicago, IL",
      "Houston, TX",
      "Phoenix, AZ",
      "Philadelphia, PA",
      "San Antonio, TX",
      "San Diego, CA",
      "Dallas, TX",
      "San Jose, CA",
      "Austin, TX",
      "Jacksonville, FL",
      "Fort Worth, TX",
      "Columbus, OH",
      "Charlotte, NC",
      "San Francisco, CA",
      "Indianapolis, IN",
      "Seattle, WA",
      "Denver, CO",
      "Boston, MA",
      "Nashville, TN",
      "Portland, OR",
      "Las Vegas, NV",
      "Detroit, MI",
      "Miami, FL",
      "Atlanta, GA",
      "Minneapolis, MN",
      "Tampa, FL",
      "Orlando, FL",
      "Washington, DC",
    ],
  },
  {
    heading: "Canada",
    options: [
      "Canada (National)",
      "Toronto, Canada",
      "Vancouver, Canada",
      "Montreal, Canada",
      "Calgary, Canada",
      "Ottawa, Canada",
    ],
  },
  {
    heading: "Europe",
    options: [
      "Europe (General)",
      "London, UK",
      "Dublin, Ireland",
      "Paris, France",
      "Berlin, Germany",
      "Munich, Germany",
      "Amsterdam, Netherlands",
      "Brussels, Belgium",
      "Zurich, Switzerland",
      "Stockholm, Sweden",
      "Madrid, Spain",
      "Barcelona, Spain",
      "Milan, Italy",
      "Rome, Italy",
      "Warsaw, Poland",
    ],
  },
  {
    heading: "Asia-Pacific",
    options: [
      "Asia-Pacific (General)",
      "Singapore",
      "Hong Kong",
      "Tokyo, Japan",
      "Seoul, South Korea",
      "Sydney, Australia",
      "Melbourne, Australia",
      "Auckland, New Zealand",
      "Mumbai, India",
      "Bengaluru, India",
      "Delhi, India",
      "Jakarta, Indonesia",
      "Bangkok, Thailand",
      "Manila, Philippines",
    ],
  },
  {
    heading: "Latin America",
    options: [
      "Latin America (General)",
      "Mexico City, Mexico",
      "Sao Paulo, Brazil",
      "Rio de Janeiro, Brazil",
      "Buenos Aires, Argentina",
      "Santiago, Chile",
      "Bogota, Colombia",
      "Lima, Peru",
    ],
  },
  {
    heading: "Middle East & Africa",
    options: [
      "Middle East (General)",
      "Dubai, UAE",
      "Abu Dhabi, UAE",
      "Tel Aviv, Israel",
      "Riyadh, Saudi Arabia",
      "Johannesburg, South Africa",
      "Cape Town, South Africa",
      "Nairobi, Kenya",
    ],
  },
  {
    heading: "US Regions",
    options: [
      "Northeast US",
      "Southeast US",
      "Midwest US",
      "Southwest US",
      "West Coast",
      "Pacific Northwest",
      "Mountain West",
      "Gulf Coast",
      "New England",
      "Mid-Atlantic",
    ],
  },
];

const ALL_LOCATIONS: LocationOption[] = LOCATION_GROUPS.flatMap((g) =>
  g.options.map((label) => ({ label, group: g.heading }))
);

function groupBy<T extends { group: string }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const arr = map.get(item.group) ?? [];
    arr.push(item);
    map.set(item.group, arr);
  }
  return map;
}

interface LocationComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function LocationCombobox({
  value,
  onChange,
  placeholder = "Search for your location...",
}: LocationComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start text-left font-normal h-12 bg-background border-border hover:bg-muted/50"
        >
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
          {value ? (
            <span className="truncate">{value}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50 bg-popover border border-border shadow-lg" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {search.length > 0 ? (
                <CommandItem
                  onSelect={() => {
                    onChange(search);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="cursor-pointer"
                >
                  <span>Use "{search}"</span>
                </CommandItem>
              ) : (
                <span className="text-muted-foreground text-sm p-2">Start typing to search...</span>
              )}
            </CommandEmpty>
            {LOCATION_GROUPS.map((group, idx) => (
              <React.Fragment key={group.heading}>
                {idx > 0 && <CommandSeparator />}
                <CommandGroup heading={group.heading}>
                  {group.options.map((location) => (
                    <CommandItem
                      key={`${group.heading}:${location}`}
                      value={location}
                      keywords={[location, group.heading]}
                      onSelect={(currentValue) => {
                        onChange(currentValue);
                        setOpen(false);
                        setSearch("");
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === location ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {location}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
