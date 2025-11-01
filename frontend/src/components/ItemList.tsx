import { Item } from '@/types/item'
import EnhancedProductCard from './ProductCard'

// Enhanced ItemList Component
const ItemList: React.FC<{
  items: Item[]
  onEdit: (item: Item) => void
  onDelete: (id: string) => void
}> = ({ items, onEdit, onDelete }) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
      {items.map((item, index) => (
        <div
          key={item.itemId}
          className='animate-in slide-in-from-bottom-10 duration-500'
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <EnhancedProductCard item={item} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    </div>
  )
}

export default ItemList
