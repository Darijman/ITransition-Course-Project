import { DataSource } from 'typeorm';
import { User } from 'src/users/user.entity';
import { UserRoles } from 'src/users/userRoles.enum';

const usersToCreate = [
  { name: 'john1', email: 'john1.official@mail.ru', password: '123456', role: UserRoles.USER },
  { name: 'ADMIN', email: 'admin.official@mail.ru', password: '123456', role: UserRoles.ADMIN },
];

export const seedUsers = async (dataSource: DataSource) => {
  const usersRepository = dataSource.getRepository(User);
  const users = await usersRepository.find();

  if (!users.length) {
    const userEntities = usersToCreate.map((user) => {
      const entity = new User();
      Object.assign(entity, user);
      return entity;
    });

    await usersRepository.save(userEntities);
    console.log('✅ Users seeded');
  } else {
    console.log('ℹ️ Users already exist!');
  }
};
