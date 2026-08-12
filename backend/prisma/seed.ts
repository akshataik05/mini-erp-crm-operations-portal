import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed database script...');

  // 1. Clean existing records
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned up existing database tables.');

  // 2. Create Users for all 4 Roles
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const salesHash = await bcrypt.hash('Sales@123', 10);
  const warehouseHash = await bcrypt.hash('Warehouse@123', 10);
  const accountsHash = await bcrypt.hash('Accounts@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@minierp.com',
      password: passwordHash,
      role: 'ADMIN'
    }
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Sara Sales',
      email: 'sales@minierp.com',
      password: salesHash,
      role: 'SALES'
    }
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Wally Warehouse',
      email: 'warehouse@minierp.com',
      password: warehouseHash,
      role: 'WAREHOUSE'
    }
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Alice Accounts',
      email: 'accounts@minierp.com',
      password: accountsHash,
      role: 'ACCOUNTS'
    }
  });

  console.log('✅ Created 4 Role Users (ADMIN, SALES, WAREHOUSE, ACCOUNTS).');

  // 3. Create Sample CRM Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Rajesh Sharma',
      mobile: '+919876543210',
      email: 'rajesh@apexretail.com',
      businessName: 'Apex Retail Enterprises',
      gstNumber: '27AAAAA0000A1Z5',
      customerType: 'RETAIL',
      address: 'Plot 42, Industrial Area Phase 1, Mumbai, MH',
      status: 'ACTIVE',
      followUpDate: new Date('2026-08-20'),
      notes: 'Key retail partner. Interested in quarterly bulk orders.'
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Ananya Verma',
      mobile: '+919812345678',
      email: 'ananya@globaldynamics.com',
      businessName: 'Global Dynamics Corp',
      gstNumber: '07BBBBA1111B2Z8',
      customerType: 'WHOLESALE',
      address: 'Tower B, Tech Park, Sector 62, Noida, UP',
      status: 'LEAD',
      followUpDate: new Date('2026-08-15'),
      notes: 'Initial quotation sent. Requesting 10% volume discount.'
    }
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Vikram Mehta',
      mobile: '+919988776655',
      email: 'vikram@zenithdist.com',
      businessName: 'Zenith Wholesale Distributors',
      gstNumber: '29CCCCC2222C3Z1',
      customerType: 'DISTRIBUTOR',
      address: '88 Commercial Street, Bengaluru, KA',
      status: 'ACTIVE',
      followUpDate: new Date('2026-08-30'),
      notes: 'Distributor for South Zone operations.'
    }
  });

  console.log('✅ Created 3 sample Customers.');

  // 4. Create Sample Products & Initial Stock Movements
  const product1 = await prisma.product.create({
    data: {
      name: 'Heavy-Duty Ball Bearing 6205',
      sku: 'SKU-BRG-6205',
      category: 'Bearings',
      unitPrice: 450.0,
      currentStock: 150,
      minimumStock: 30,
      warehouseLocation: 'Bay A - Shelf 3'
    }
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Industrial Control Valve V-200',
      sku: 'SKU-VLV-200',
      category: 'Valves',
      unitPrice: 3200.0,
      currentStock: 40,
      minimumStock: 10,
      warehouseLocation: 'Bay B - Rack 12'
    }
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Precision Pressure Gauge PG-100',
      sku: 'SKU-GAU-100',
      category: 'Instruments',
      unitPrice: 1250.0,
      currentStock: 8,
      minimumStock: 15,
      warehouseLocation: 'Bay C - Shelf 1'
    }
  });

  const product4 = await prisma.product.create({
    data: {
      name: 'Hydraulic Cylinder X500',
      sku: 'SKU-CYL-X500',
      category: 'Hydraulics',
      unitPrice: 8500.0,
      currentStock: 25,
      minimumStock: 5,
      warehouseLocation: 'Bay D - Floor Area'
    }
  });

  console.log('✅ Created 4 sample Products.');

  // Log Initial IN Stock Movements
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: product1.id,
        quantity: 150,
        movementType: 'IN',
        reason: 'Initial warehouse stock count',
        createdBy: warehouseUser.id
      },
      {
        productId: product2.id,
        quantity: 40,
        movementType: 'IN',
        reason: 'Supplier shipment receipt PO-882',
        createdBy: warehouseUser.id
      },
      {
        productId: product3.id,
        quantity: 8,
        movementType: 'IN',
        reason: 'Opening stock audit',
        createdBy: warehouseUser.id
      },
      {
        productId: product4.id,
        quantity: 25,
        movementType: 'IN',
        reason: 'Initial stock intake',
        createdBy: warehouseUser.id
      }
    ]
  });

  console.log('✅ Created initial Stock Movements.');

  // 5. Create Sample Sales Challans
  await prisma.challan.create({
    data: {
      challanNumber: 'CHAL-2026-0001',
      customerId: customer1.id,
      totalQuantity: 10,
      totalAmount: 4500.0,
      status: 'DRAFT',
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: product1.id,
            productNameSnapshot: product1.name,
            skuSnapshot: product1.sku,
            unitPriceSnapshot: product1.unitPrice,
            quantity: 10
          }
        ]
      }
    }
  });

  const confirmedChallan = await prisma.challan.create({
    data: {
      challanNumber: 'CHAL-2026-0002',
      customerId: customer3.id,
      totalQuantity: 5,
      totalAmount: 16000.0,
      status: 'CONFIRMED',
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: product2.id,
            productNameSnapshot: product2.name,
            skuSnapshot: product2.sku,
            unitPriceSnapshot: product2.unitPrice,
            quantity: 5
          }
        ]
      }
    }
  });

  await prisma.stockMovement.create({
    data: {
      productId: product2.id,
      quantity: 5,
      movementType: 'OUT',
      reason: `Sales Challan Confirmation: ${confirmedChallan.challanNumber}`,
      createdBy: salesUser.id
    }
  });

  console.log('✅ Created sample DRAFT and CONFIRMED Challans.');
  console.log('🎉 Seed script completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error executing seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
