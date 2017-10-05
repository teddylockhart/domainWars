var expect = require('chai').expect;
var assert = require('chai').assert;
var request = require('request');
var apiUrl = "http://localhost:3001";

describe('GET /allcards', function() {
    var url = apiUrl + '/allcards';
    it('should return status 200 with all the cards in the database', function(done) {
        request({
            uri: url,
            method: 'GET',
        }, function(error, body, response) {
            expect(body.statusCode).to.equal(200);
            done();
        });
    });
    it('should return a response length a minimum of 1', function(done) {
      request({
          uri: url,
          method: 'GET',
      }, function(error, body, response) {
          expect(JSON.parse(response).length).to.be.at.least(1);
          // console.log(JSON.parse(response).length);
          done();
      });
  });
});