import { DataSource } from 'typeorm';
import { InventoryCategory } from 'src/inventoryCategories/inventoryCategory.entity';

const inventoryCategoriesToCreate = [
  { title: 'Electronics', description: 'Devices and gadgets like phones, laptops, cameras' },
  { title: 'Furniture', description: 'Home and office furniture items' },
  { title: 'Books', description: 'Printed and digital books across genres' },
  { title: 'Clothing', description: 'Apparel including shirts, pants, jackets, etc.' },
  { title: 'Tools', description: 'Hand tools and power tools for construction and repairs' },
  { title: 'Toys', description: 'Children toys and games' },
  { title: 'Kitchen', description: 'Kitchen appliances and utensils' },
  { title: 'Sports', description: 'Sporting goods and outdoor equipment' },
  { title: 'Beauty', description: 'Cosmetics, skincare, and personal care products' },
  { title: 'Automotive', description: 'Car parts, accessories, and tools' },
];

export const seedInventoryCategories = async (dataSource: DataSource) => {
  const inventoryCategoriesRepository = dataSource.getRepository(InventoryCategory);
  const inventoryCategories = await inventoryCategoriesRepository.find();

  if (!inventoryCategories.length) {
    await inventoryCategoriesRepository.save(inventoryCategoriesToCreate);
    console.log('✅ Inventory tags seeded');
  } else {
    console.log('ℹ️ Inventory tags already exist!');
  }
};
