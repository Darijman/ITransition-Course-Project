import { DataSource } from 'typeorm';
import { InventoryTag } from 'src/inventoryTags/inventoryTag.entity';

const inventoryTagsToCreate = [
  { title: 'Portable', description: 'Easy to carry and move around' },
  { title: 'Bluetooth', description: 'Supports Bluetooth connectivity' },
  { title: 'On Sale', description: 'Currently discounted item' },
  { title: 'New Arrival', description: 'Recently added to the inventory' },
  { title: 'Limited Edition', description: 'Exclusive or special edition item' },
  { title: 'Refurbished', description: 'Restored to like-new condition' },
  { title: 'Eco-friendly', description: 'Environmentally sustainable product' },
  { title: 'Heavy Duty', description: 'Designed for tough or industrial use' },
  { title: 'Handmade', description: 'Crafted manually with care' },
  { title: 'Wireless', description: 'Does not require cables' },
];

export const seedInventoryTags = async (dataSource: DataSource) => {
  const inventoryTagsRepository = dataSource.getRepository(InventoryTag);
  const inventoryTags = await inventoryTagsRepository.find();

  if (!inventoryTags.length) {
    await inventoryTagsRepository.save(inventoryTagsToCreate);
    console.log('✅ Inventory tags seeded');
  } else {
    console.log('ℹ️ Inventory tags already exist!');
  }
};
