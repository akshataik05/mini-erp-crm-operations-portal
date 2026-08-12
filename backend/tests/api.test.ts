import request from 'supertest';
import app from '../src/app';
import { AuthService } from '../src/services/auth.service';
import { CustomerService } from '../src/services/customer.service';
import { ProductService } from '../src/services/product.service';
import { StockService } from '../src/services/stock.service';
import { ChallanService } from '../src/services/challan.service';
import { UserService } from '../src/services/user.service';
import { generateToken } from '../src/utils/jwt';

// Valid UUID strings matching Zod validation rules
const CUST_UUID = '11111111-1111-4111-8111-111111111111';
const PROD_UUID = '22222222-2222-4222-8222-222222222222';
const CHAL_UUID = '33333333-3333-4333-8333-333333333333';
const USER_ADMIN_UUID = '44444444-4444-4444-8444-444444444444';
const USER_SALES_UUID = '55555555-5555-4555-8555-555555555555';
const USER_WH_UUID = '66666666-6666-4666-8666-666666666666';

const mockAdminPayload = { id: USER_ADMIN_UUID, name: 'Test Admin', email: 'admin@minierp.com', role: 'ADMIN' as const };
const mockSalesPayload = { id: USER_SALES_UUID, name: 'Test Sales', email: 'sales@minierp.com', role: 'SALES' as const };
const mockWarehousePayload = { id: USER_WH_UUID, name: 'Test Warehouse', email: 'warehouse@minierp.com', role: 'WAREHOUSE' as const };

const mockAdminToken = generateToken(mockAdminPayload);
const mockSalesToken = generateToken(mockSalesPayload);
const mockWarehouseToken = generateToken(mockWarehousePayload);

const mockCustomerRecord = {
  id: CUST_UUID,
  name: 'Acme Traders',
  mobile: '+919999988888',
  email: 'info@acmetraders.com',
  businessName: 'Acme Trade Pvt Ltd',
  gstNumber: '27AAAAA1111A1Z1',
  customerType: 'WHOLESALE' as const,
  address: 'Building 10, Industrial Hub',
  status: 'ACTIVE' as const,
  notes: 'Important client',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockProductRecord = {
  id: PROD_UUID,
  name: 'Precision Valve V1',
  sku: 'SKU-TEST-V1',
  category: 'Valves',
  unitPrice: 1500,
  currentStock: 50,
  minimumStock: 10,
  warehouseLocation: 'Rack B1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockDraftChallanRecord = {
  id: CHAL_UUID,
  challanNumber: 'CHAL-2026-0001',
  customerId: CUST_UUID,
  totalQuantity: 20,
  totalAmount: 30000,
  status: 'DRAFT' as const,
  createdBy: USER_SALES_UUID,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: 'item-1',
      challanId: CHAL_UUID,
      productId: PROD_UUID,
      productNameSnapshot: 'Precision Valve V1',
      skuSnapshot: 'SKU-TEST-V1',
      unitPriceSnapshot: 1500,
      quantity: 20
    }
  ]
};

const mockConfirmedChallanRecord = {
  ...mockDraftChallanRecord,
  status: 'CONFIRMED' as const
};

describe('Mini ERP + CRM Operations Portal Compliance Audit Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Authentication & RBAC Audits', () => {
    it('POST /api/auth/login -> should authenticate ADMIN user and return JWT', async () => {
      jest.spyOn(AuthService, 'login').mockResolvedValueOnce({
        token: mockAdminToken,
        user: mockAdminPayload
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@minierp.com', password: 'Admin@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('ADMIN');
    });

    it('POST /api/auth/login -> should authenticate SALES and WAREHOUSE users', async () => {
      jest.spyOn(AuthService, 'login').mockResolvedValueOnce({
        token: mockSalesToken,
        user: mockSalesPayload
      });

      const salesRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'sales@minierp.com', password: 'Sales@123' });
      expect(salesRes.status).toBe(200);
      expect(salesRes.body.success).toBe(true);
      expect(salesRes.body.data.user.role).toBe('SALES');

      jest.spyOn(AuthService, 'login').mockResolvedValueOnce({
        token: mockWarehouseToken,
        user: mockWarehousePayload
      });

      const whRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'warehouse@minierp.com', password: 'Warehouse@123' });
      expect(whRes.status).toBe(200);
      expect(whRes.body.success).toBe(true);
      expect(whRes.body.data.user.role).toBe('WAREHOUSE');
    });

    it('GET /api/auth/me -> should fetch profile for authenticated user', async () => {
      jest.spyOn(AuthService, 'me').mockResolvedValueOnce({
        id: mockAdminPayload.id,
        name: mockAdminPayload.name,
        email: mockAdminPayload.email,
        role: mockAdminPayload.role,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('admin@minierp.com');
    });

    it('GET /api/customers -> should reject unauthorized request without Bearer token (HTTP 401)', async () => {
      const res = await request(app).get('/api/customers');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('POST /api/users -> should reject non-Admin user role creation (HTTP 403)', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${mockSalesToken}`)
        .send({ name: 'Hacker', email: 'hacker@test.com', password: 'Password123', role: 'ADMIN' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('FORBIDDEN');
    });
  });

  describe('2. Customer CRM Module Audit', () => {
    it('POST /api/customers -> SALES creates customer', async () => {
      jest.spyOn(CustomerService, 'createCustomer').mockResolvedValueOnce(mockCustomerRecord as any);

      const res = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${mockSalesToken}`)
        .send({
          name: 'Acme Traders',
          mobile: '+919999988888',
          email: 'info@acmetraders.com',
          businessName: 'Acme Trade Pvt Ltd',
          gstNumber: '27AAAAA1111A1Z1',
          customerType: 'WHOLESALE',
          address: 'Building 10, Industrial Hub',
          status: 'ACTIVE',
          notes: 'Important wholesale client'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(CUST_UUID);
    });

    it('GET /api/customers -> lists customers with search & pagination', async () => {
      jest.spyOn(CustomerService, 'getCustomers').mockResolvedValueOnce({
        customers: [mockCustomerRecord as any],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 }
      });

      const res = await request(app)
        .get('/api/customers?page=1&limit=10&search=Acme&status=ACTIVE')
        .set('Authorization', `Bearer ${mockSalesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.meta.page).toBe(1);
    });

    it('GET /api/customers/:id -> returns customer detail profile', async () => {
      jest.spyOn(CustomerService, 'getCustomerById').mockResolvedValueOnce(mockCustomerRecord as any);

      const res = await request(app)
        .get(`/api/customers/${CUST_UUID}`)
        .set('Authorization', `Bearer ${mockSalesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Acme Traders');
    });
  });

  describe('3. Products & Stock Movement Audit', () => {
    it('POST /api/products -> WAREHOUSE creates product', async () => {
      jest.spyOn(ProductService, 'createProduct').mockResolvedValueOnce(mockProductRecord as any);

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${mockWarehouseToken}`)
        .send({
          name: 'Precision Valve V1',
          sku: 'SKU-TEST-V1',
          category: 'Valves',
          unitPrice: 1500,
          currentStock: 0,
          minimumStock: 10,
          warehouseLocation: 'Rack B1'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toBe('SKU-TEST-V1');
    });

    it('POST /api/stock-movements -> WAREHOUSE records IN stock movement (+50 units)', async () => {
      jest.spyOn(StockService, 'createStockMovement').mockResolvedValueOnce({
        movement: {
          id: 'sm-1',
          productId: PROD_UUID,
          quantity: 50,
          movementType: 'IN',
          reason: 'Initial intake',
          createdBy: mockWarehousePayload.id,
          createdAt: new Date()
        } as any,
        product: { ...mockProductRecord, currentStock: 50 } as any
      });

      const res = await request(app)
        .post('/api/stock-movements')
        .set('Authorization', `Bearer ${mockWarehouseToken}`)
        .send({
          productId: PROD_UUID,
          quantity: 50,
          movementType: 'IN',
          reason: 'Initial intake PO-880'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('4. Sales Challans & Concurrency Transaction Audit', () => {
    it('POST /api/challans -> SALES creates DRAFT challan', async () => {
      jest.spyOn(ChallanService, 'createChallan').mockResolvedValueOnce(mockDraftChallanRecord as any);

      const res = await request(app)
        .post('/api/challans')
        .set('Authorization', `Bearer ${mockSalesToken}`)
        .send({
          customerId: CUST_UUID,
          items: [{ productId: PROD_UUID, quantity: 20 }]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DRAFT');
    });

    it('POST /api/challans/:id/confirm -> rejects when stock is insufficient (HTTP 400 PRODUCT_OUT_OF_STOCK)', async () => {
      const InsufficientStockError = require('../src/utils/errors').InsufficientStockError;
      jest.spyOn(ChallanService, 'confirmChallan').mockRejectedValueOnce(
        new InsufficientStockError('Insufficient stock for Precision Valve V1. Required: 100, Available: 50')
      );

      const res = await request(app)
        .post(`/api/challans/${CHAL_UUID}/confirm`)
        .set('Authorization', `Bearer ${mockSalesToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('PRODUCT_OUT_OF_STOCK');
    });

    it('POST /api/challans/:id/confirm -> executes atomic transaction and confirms challan', async () => {
      jest.spyOn(ChallanService, 'confirmChallan').mockResolvedValueOnce(mockConfirmedChallanRecord as any);

      const res = await request(app)
        .post(`/api/challans/${CHAL_UUID}/confirm`)
        .set('Authorization', `Bearer ${mockSalesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CONFIRMED');
    });

    it('POST /api/challans/:id/confirm -> rejects duplicate confirmation attempt', async () => {
      const BadRequestError = require('../src/utils/errors').BadRequestError;
      jest.spyOn(ChallanService, 'confirmChallan').mockRejectedValueOnce(
        new BadRequestError('Challan is already confirmed', 'CHALLAN_ALREADY_CONFIRMED')
      );

      const res = await request(app)
        .post(`/api/challans/${CHAL_UUID}/confirm`)
        .set('Authorization', `Bearer ${mockSalesToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('CHALLAN_ALREADY_CONFIRMED');
    });
  });
});
