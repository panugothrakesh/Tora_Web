"use client";
import { Category } from "@/sanity.types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
interface CategorySelectorProps {
  categories: Category[];
}
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "./command";
import { Check, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

export function CategorySelectorComponent({
  categories,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("");
  const router = useRouter();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-full relative flex justify-center sm:justify-start sm:flex-none items-center space-x-2 bg-primaryText hover:bg-black text-white font-bold py-2 px-4 rounded-md"
        >
          {value
            ? categories.find((category) => category._id === value)?.title
            : "Filtered by Category"}
          {open ? (
            <ChevronUpIcon className="ml-2 h-4 w-4 shrink-0" />
          ) : (
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0 bg-white">
        <Command>
          <CommandInput
            placeholder="Search categories..."
            className="h-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const selectedCategory = categories.find((c) =>
                  c.title
                    ?.toLowerCase()
                    .includes(e.currentTarget.value.toLowerCase())
                );
                if (selectedCategory?.slug?.current) {
                  setValue(selectedCategory._id);
                  router.push(`/categories/${selectedCategory.slug.current}`);
                  setOpen(false);
                }
              }
            }}
          />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category._id}
                  value={category.title}
                  onSelect={() => {
                    setValue(category._id);
                    router.push(`/categories/${category.slug?.current}`);
                    setOpen(false);
                  }}
                >
                  {category.title}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === category._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
