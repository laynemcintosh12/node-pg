process.env.NODE_ENV = "test";
const request = require('supertest');
const app = require('../app'); 
const db = require('../db'); 


describe('Companies Routes', () => {
  let testCompanyCode;

  beforeAll(async () => {
    // Create a test company in the database for testing
    const result = await db.query(`
      INSERT INTO companies (code, name, description)
      VALUES ('test', 'Test Company', 'Test Description')
      RETURNING code
    `);
    testCompanyCode = result.rows[0].code;
  });

  afterEach(async function() {
    // delete any data created by test
    await db.query("DELETE FROM cats");
  });
  
  afterAll(async function() {
    // close db connection
    await db.end();
  });


  describe('GET /companies', () => {
    it('should get a list of companies', async () => {
      const res = await request(app).get('/companies');
      expect(res.statusCode).toBe(200);
      expect(res.body.companies).toHaveLength(1); // Assuming only one test company
    });
  });


  describe('GET /companies/:code', () => {
    it('should get a single company', async () => {
      const res = await request(app).get(`/companies/${testCompanyCode}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.company.code).toBe(testCompanyCode);
    });

    it('should return 404 for a non-existent company', async () => {
      const res = await request(app).get('/companies/nonexistentcode');
      expect(res.statusCode).toBe(404);
    });
  });


  describe('POST /companies', () => {
    it('should create a new company', async () => {
      const newCompany = {
        name: 'New Test Company',
        description: 'New Test Description',
      };

      const res = await request(app)
        .post('/companies')
        .send(newCompany);

      expect(res.statusCode).toBe(201);
      expect(res.body.company.code).toBeDefined();

      testCompanyCode = res.body.company.code;
    });
  });


  describe('PUT /companies/:code', () => {
    it('should update an existing company', async () => {
      const updatedCompany = {
        name: 'Updated Test Company',
        description: 'Updated Test Description',
      };

      const res = await request(app)
        .put(`/companies/${testCompanyCode}`)
        .send(updatedCompany);

      expect(res.statusCode).toBe(200);
      expect(res.body.company.code).toBe(testCompanyCode);
      expect(res.body.company.name).toBe(updatedCompany.name);
      expect(res.body.company.description).toBe(updatedCompany.description);
    });

    it('should return 404 for a non-existent company', async () => {
      const updatedCompany = {
        name: 'Updated Test Company',
        description: 'Updated Test Description',
      };

      const res = await request(app)
        .put('/companies/nonexistentcode')
        .send(updatedCompany);

      expect(res.statusCode).toBe(404);
    });
  });


  describe('DELETE /companies/:code', () => {
    it('should delete an existing company', async () => {
      const res = await request(app).delete(`/companies/${testCompanyCode}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('deleted');
    });

    it('should return 404 for deleting a non-existent company', async () => {
      const res = await request(app).delete('/companies/2664567445674567');
      expect(res.statusCode).toBe(404);
    });
  });
});
