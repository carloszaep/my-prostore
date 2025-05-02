import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllCategories } from '@/lib/actions/products.actions';

import { SearchIcon } from 'lucide-react';

const Search = async ({ mobil = false }: { mobil?: boolean }) => {
  const categories = await getAllCategories();

  return (
    <form action='/search' method='GET'>
      <div className='flex w-full max-w-sm items-center space-x-2'>
        {!mobil && (
          <Select name='category'>
            <SelectTrigger>
              <SelectValue placeholder='All' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key='All' value='all'>
                All
              </SelectItem>
              {categories.map((x) => (
                <SelectItem key={x.category} value={x.category}>
                  {x.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Input
          name='q'
          type='search'
          placeholder='Search...'
          className='md:w-[100px] lg:w-[300px]'
          autoFocus={false}
        />

        {!mobil && (
          <Button variant={'outline'}>
            <SearchIcon />
          </Button>
        )}
      </div>
    </form>
  );
};

export default Search;
