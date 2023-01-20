const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');


chai.use(chaiHttp);


describe('User Authentication', function () {
  it('should Register user, login user', function (done) {
    chai
      .request(server)
      .post('/api/user/signup')
      .send({
        name: 'Fred',
        email: 'tester@gmail.com',
        password: 'tester',
      })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });
});
