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
      
      expect(response.status).toEqual(422);
  })
})

describe("PUT /api/users/:id", () => {
  it("should edit user", async() => {
    const newUser = {
      firstname: "Tom",
      lastname: "Tommy",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "tokyo",
      language: "japonais"
    }

    const [result] = await userDatabase.query(
      "INSERT INTO users(firstname, lastname, email, city, language) VALUES(?, ?, ?, ?, ?)",
      [newUser.firstname, newUser.lastname, newUser.email, newUser.city, newUser.language]
    );

    const id = result.insertId;

    const updateUser = {
      firstname: "とむ",
      lastname: "とみー",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "東京",
      language: "日本語"
    }

    const response = await request(app)
      .put(`/api/users/${id}`)
      .send(updateUser);

    expect(response.status).toEqual(204);

    const [users] = await userDatabase.query("SELECT * FROM users WHERE id = ?", id);
    const [userInDatabase] = users;

    expect(userInDatabase).toHaveProperty("id");

    expect(userInDatabase).toHaveProperty("firstname");
    expect(userInDatabase.firstname).toStrictEqual(updateUser.firstname);

    expect(userInDatabase).toHaveProperty("lastname");
    expect(userInDatabase.lastname).toStrictEqual(updateUser.lastname);

    expect(userInDatabase).toHaveProperty("email");
    expect(userInDatabase.email).toStrictEqual(updateUser.email);

    expect(userInDatabase).toHaveProperty("city");
    expect(userInDatabase.city).toStrictEqual(updateUser.city);

    expect(userInDatabase).toHaveProperty("language");
    expect(userInDatabase.language).toStrictEqual(updateUser.language);
  })
  it("should return an error", async() => {
    const userWithMissingProps = {firstname: "なまえ"};
    const response = await request(app)
      .put(`/api/users/1`)
      .send(userWithMissingProps);

    expect(response.status).toEqual(422);
  });

  it("should return no user", async () => {
    const newUser = {
      firstname: "bobbbbb",
      lastname: "BOBBYbbbb",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Parisbbb",
      language: "anglaisbbb"
    }

    const response = await request(app).put("/api/users/0").send(newUser);
    expect(response.status).toEqual(404);
  })
})

describe("DELETE /api/users/:id", () => {
  it("should delete user", async() => {
    const newUser = {
      firstname: "I'll be deleted",
      lastname: "---",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Osaka",
      language: "Francais"
    }

    const [result] = await userDatabase.query(
      "INSERT INTO users(firstname, lastname, email, city, language) VALUES(?, ?, ?, ?, ?)",
      [newUser.firstname, newUser.lastname, newUser.email, newUser.city, newUser.language]
    );

    const id = result.insertId;

    const response = await request(app)
      .delete(`/api/users/${id}`)
    expect(response.status).toEqual(204);

    const responseDelete = await request(app).get(`/api/users/${id}`)
    expect(responseDelete.status).toEqual(404);
  })
})