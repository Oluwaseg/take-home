import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Product from '../models/Product';
import { logger } from '../utils/responseHandler';

dotenv.config();

// Sample products with more realistic data
const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with active noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
    price: 199.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    stock: 25
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking smartwatch with heart rate monitor, GPS, and water resistance. Track your workouts and health metrics.',
    price: 299.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    stock: 15
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Comfortable ergonomic office chair with lumbar support and adjustable height. Perfect for long work sessions.',
    price: 249.99,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
    stock: 8
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB mechanical gaming keyboard with tactile switches and customizable lighting. Built for gamers and programmers.',
    price: 129.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500',
    stock: 20
  },
  {
    name: 'Wireless Mouse',
    description: 'Precision wireless mouse with ergonomic design and long battery life. Great for both work and gaming.',
    price: 49.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7f91c4c4b0c0?w=500',
    stock: 35
  },
  {
    name: 'Standing Desk Converter',
    description: 'Adjustable standing desk converter that transforms any desk into a standing workstation. Improve your posture and health.',
    price: 179.99,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500',
    stock: 12
  },
  {
    name: 'Coffee Maker Pro',
    description: 'Professional-grade coffee maker with programmable settings and thermal carafe. Brew the perfect cup every time.',
    price: 89.99,
    category: 'Appliances',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
    stock: 18
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with 360-degree sound and waterproof design. Perfect for outdoor adventures.',
    price: 79.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    stock: 22
  },
  {
    name: 'Desk Lamp with USB',
    description: 'LED desk lamp with USB charging port and adjustable brightness. Modern design with touch control.',
    price: 39.99,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    stock: 30
  },
  {
    name: 'Laptop Stand',
    description: 'Adjustable aluminum laptop stand with ventilation holes. Improve your laptop setup and ergonomics.',
    price: 29.99,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7f91c4c4b0c0?w=500',
    stock: 40
  },
  {
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.',
    price: 24.99,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f4bae1e?w=500',
    stock: 28
  },
  {
    name: 'Monitor Mount',
    description: 'Dual monitor mount with full motion adjustment. Free up desk space and improve your viewing experience.',
    price: 69.99,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500',
    stock: 16
  }
];

const sampleUsers = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'testuser',
    password: 'test123',
    role: 'user'
  },
  {
    username: 'john_doe',
    password: 'password123',
    role: 'user'
  },
  {
    username: 'jane_smith',
    password: 'password123',
    role: 'user'
  }
];

const seedDatabase = async () => {
  try {
    logger.info('🌱 Starting database seeding...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/product-listing';
    await mongoose.connect(mongoUri);
    logger.info('✅ Connected to MongoDB');

    // Clear existing data
    logger.info('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    logger.info('✅ Existing data cleared');

    // Create users
    logger.info('👥 Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      logger.info(`✅ Created user: ${user.username} (${user.role})`);
    }

    // Create products
    logger.info('📦 Creating products...');
    const createdProducts = [];
    for (const productData of sampleProducts) {
      const product = new Product(productData);
      await product.save();
      createdProducts.push(product);
      logger.info(`✅ Created product: ${product.name} - $${product.price}`);
    }

    // Summary
    logger.info('🎉 Database seeding completed successfully!');
    logger.info(`📊 Summary:`);
    logger.info(`   - Users created: ${createdUsers.length}`);
    logger.info(`   - Products created: ${createdProducts.length}`);
    logger.info(`   - Total value: $${createdProducts.reduce((sum, p) => sum + p.price, 0).toFixed(2)}`);
    
    logger.info('\n🔑 Login credentials:');
    logger.info('   Admin: admin / admin123');
    logger.info('   User: testuser / test123');
    logger.info('   User: john_doe / password123');
    logger.info('   User: jane_smith / password123');
    
    logger.info('\n🚀 You can now start the server with: pnpm run dev');

  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('👋 Disconnected from MongoDB');
  }
};

// Run seeding
seedDatabase()
  .then(() => {
    logger.info('✅ Seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Seeding process failed:', error);
    process.exit(1);
  });