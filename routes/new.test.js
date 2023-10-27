process.env.NODE_ENV = "test";
const request = require('supertest');
const app = require('../app'); 
const db = require('../db'); 

describe('Industry Routes', () => {
  let testIndustryCode;

  beforeAll(async () => {
    // Create a test industry in the database for testing
    const result = await db.query(`
      INSERT INTO industries (code, industry)
      VALUES ('test', 'Test Industry')
      RETURNING code
    `);
    testIndustryCode = result.rows[0].code;
  });

  afterEach(async function() {
    // delete any data created by test
    await db.query("DELETE FROM cats");
  });
  
  afterAll(async function() {
    // close db connection
    await db.end();
  });


  describe('POST /industries', () => {
    it('should create a new industry', async () => {
      const newIndustry = {
        code: 'newind',
        industry: 'New Industry',
      };

      const res = await request(app)
        .post('/industries')
        .send(newIndustry);

      expect(res.statusCode).toBe(201);
      expect(res.body.industry.code).toBeDefined();
      testIndustryCode = res.body.industry.code;
    });
  });


  describe('GET /industries', () => {
    it('should list all industries with associated company codes', async () => {
      const res = await request(app).get('/industries');
      expect(res.statusCode).toBe(200);
      expect(res.body.industries).toHaveLength(1); // Assuming only one test industry
    });
  });


  describe('POST /companies/:comp_code/industries/:industry_code', () => {
    it('should associate an industry with a company', async () => {
      const newCompany = {
        code: 'newcomp',
        name: 'New Company',
        description: 'New Description',
      };

      const resCompany = await request(app)
        .post('/companies')
        .send(newCompany);

      expect(resCompany.statusCode).toBe(201);
      const res = await request(app).post(`/companies/${resCompany.body.company.code}/industries/${testIndustryCode}`);
      expect(res.statusCode).toBe(201);
    });
  });
});
