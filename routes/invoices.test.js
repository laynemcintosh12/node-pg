process.env.NODE_ENV = "test";
const request = require('supertest');
const app = require('../app'); 
const db = require('../db');

describe('Invoice Routes', () => {
  let testInvoiceId;

  beforeAll(async () => {
    // Create a test invoice in the database for testing
    const result = await db.query(`
      INSERT INTO invoices (comp_code, amt)
      VALUES ('testcomp', 100.00)
      RETURNING id
    `);
    testInvoiceId = result.rows[0].id;
  });

  afterEach(async function() {
    // delete any data created by test
    await db.query("DELETE FROM cats");
  });
  
  afterAll(async function() {
    // close db connection
    await db.end();
  });


  describe('GET /invoices', () => {
    it('should get a list of invoices', async () => {
      const res = await request(app).get('/invoices');
      expect(res.statusCode).toBe(200);
      expect(res.body.invoices).toHaveLength(1); // Assuming only one test invoice
    });
  });


  describe('GET /invoices/:id', () => {
    it('should get a single invoice', async () => {
      const res = await request(app).get(`/invoices/${testInvoiceId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.invoice.id).toBe(testInvoiceId);
    });

    it('should return 404 for a non-existent invoice', async () => {
      const res = await request(app).get('/invoices/9999'); // Assuming ID 9999 doesn't exist
      expect(res.statusCode).toBe(404);
    });
  });


  describe('POST /invoices', () => {
    it('should create a new invoice', async () => {
      const newInvoice = {
        comp_code: 'newcomp',
        amt: 200.00,
      };

      const res = await request(app)
        .post('/invoices')
        .send(newInvoice);

      expect(res.statusCode).toBe(200);
      expect(res.body.invoice.id).toBeDefined();

      testInvoiceId = res.body.invoice.id;
    });
  });


  describe('PUT /invoices/:id', () => {
    it('should update an existing invoice', async () => {
      const updatedInvoice = {
        amt: 300.00,
        paid: true,
      };

      const res = await request(app)
        .put(`/invoices/${testInvoiceId}`)
        .send(updatedInvoice);

      expect(res.statusCode).toBe(200);
      expect(res.body.invoice.id).toBe(testInvoiceId);
      expect(res.body.invoice.amt).toBe(updatedInvoice.amt);
      expect(res.body.invoice.paid).toBe(updatedInvoice.paid);
    });

    it('should return 404 for a non-existent invoice', async () => {
      const updatedInvoice = {
        amt: 300.00,
        paid: true,
      };

      const res = await request(app)
        .put('/invoices/9999') // Assuming ID 9999 doesn't exist
        .send(updatedInvoice);

      expect(res.statusCode).toBe(404);
    });
  });


  describe('DELETE /invoices/:id', () => {
    it('should delete an existing invoice', async () => {
      const res = await request(app).delete(`/invoices/${testInvoiceId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('deleted');
    });

    it('should return 404 for deleting a non-existent invoice', async () => {
      const res = await request(app).delete('/invoices/9999'); // Assuming ID 9999 doesn't exist
      expect(res.statusCode).toBe(404);
    });
  });
});
