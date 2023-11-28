const request = require("supertest");

const app = require("../src/app");
const userDatabase = require("../database");

const crypto = require("node:crypto");

describe("GET /api/users", () => {
  it("should return all users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

describe("GET /api/users/:id", () => {
  it("should return one user", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  it("should return no user", async () => {
    const response = await request(app).get("/api/users/0");

    expect(response.status).toEqual(404);
  });
});

describe("POST /api/users", () => {
  it("should return created user", async() =>{
    const newUser = {
      firstname: "bob",
      lastname: "BOBBY",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "anglais"
    }
    const response = await request(app).post("/api/users").send(newUser);
    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    const [userResults] = await userDatabase.query(
      "SELECT * FROM users WHERE id = ?", response.body.id
    );
    const [userInDatabase] = userResults;
    expect(userInDatabase).toHaveProperty("id");
    expect(userInDatabase).toHaveProperty("firstname");
    expect(userInDatabase).toHaveProperty("lastname");
    expect(userInDatabase).toHaveProperty("email");
    expect(userInDatabase).toHaveProperty("city");
    expect(userInDatabase).toHaveProperty("language");
    expect( typeof userInDatabase.firstname).toBe("string");
    expect( typeof userInDatabase.lastname).toBe("string");
    expect( typeof userInDatabase.email).toBe("string");
    expect( typeof userInDatabase.city).toBe("string");
    expect( typeof userInDatabase.language).toBe("string");
  })
  it("should return on error user", async() => {
    const userWithMissingProps = { city: "texas"};
    const response = await request(app)
      .post("/api/users")
      .send(userWithMissingProps);
      
      expect(response.status).toEqual(500);
  })
})