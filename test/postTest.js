const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const server = require("../index");

chai.use(chaiHttp);

describe("POST API", function () {
  it("should Register user, login user, check token and get posts", function (done) {
    chai
      .request(server)

      .post("/api/user/signup")

      .send({
        name: "Test User",
        email: "test@gmail.com",
        password: "tester",
      })
      .end((err, res) => {
        res.should.have.status(200);

        chai
          .request(server)
          .post("/api/user/login")
          // send user login details
          .send({
            email: "test@gmail.com",
            password: "tester",
          })
          .end((err, res) => {
            res.body.should.have.property("user");
            const token = res.body.user.token;

            chai
              .request(server)
              .get("/api/posts")
              .set("Authorization", `Bearer ${token}`)
              .end((err, res) => {
                res.should.have.status(200);
                done();
              });
          });
      });
  });
});
