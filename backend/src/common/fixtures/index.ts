import { AppDataSource } from '../../data.source';
import { seedInventoryCategories } from './inventoryCategories.fixture';
import { seedInventoryTags } from './inventoryTags.fixture';
import { seedUsers } from './users.fixture';

export async function seed() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  console.log('🔗 Database connected');

  try {
    await seedUsers(AppDataSource);
    await seedInventoryTags(AppDataSource);
    await seedInventoryCategories(AppDataSource);
  } catch (err) {
    console.error('❌ Seeding failed', err);
  } finally {
    // await AppDataSource.destroy();
    console.log('🌱 Seeding complete');
  }
}

seed();
