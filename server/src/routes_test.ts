import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { resetSavesForTesting, save, load, list} from './routes';


describe('routes', function() {

  // After you know what to do, feel free to delete this Dummy test
  /**
  it('dummy', function() {
    // Feel free to copy this test structure to start your own tests, but look at these
    // comments first to understand what's going on.

    // httpMocks lets us create mock Request and Response params to pass into our route functions
    const req1 = httpMocks.createRequest(
        // query: is how we add query params. body: {} can be used to test a POST request
        {method: 'POST', url: '/api/save', query: {name: 'Kevin'}}); 
    const res1 = httpMocks.createResponse();

    // call our function to execute the request and fill in the response
    save(req1, res1);

    // check that the request was successful
    assert.strictEqual(res1._getStatusCode(), 200);
    // and the response data is as expected
    assert.deepEqual(res1._getData(), {replaced: false});
  });
  */


  // TODO: add tests for your routes
  it ('save', function(){
    // first branch
    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {value: "some stuff"}});
    const res1 = httpMocks.createResponse();
    save(req1, res1);

    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(),
      'required argument "name" was missing');

    // Second branch, straight line code, error case (only one possible input)
    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "A"}});
    const res2 = httpMocks.createResponse();
    save(req2, res2);

    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(),
      'required argument "value" was missing');

    // saves new save
    const req3 = httpMocks.createRequest({method: 'POST', url: '/api/save',
      body: {name: "A", value: "some stuff"}});
    const res3 = httpMocks.createResponse();
      save(req3, res3);

    assert.strictEqual(res3._getStatusCode(), 200);
    assert.deepStrictEqual(res3._getData(), {replaced: false});

    // replaces existing save
    const req4 = httpMocks.createRequest({method: 'POST', url: '/api/save',
      body: {name: "A", value: "different stuff"}});
    const res4 = httpMocks.createResponse();
      save(req4, res4);

    assert.strictEqual(res4._getStatusCode(), 200);
    assert.deepStrictEqual(res4._getData(), {replaced: true});

    resetSavesForTesting();
  });

  it ('load', function(){
    // first branch, not valid name 
    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "A", value: "someA"}});
    const res1 = httpMocks.createResponse();
    save(req1, res1);

    const req11 = httpMocks.createRequest(
      {method: 'GET', url: '/api/load', query: {name: undefined}});
    const res11 = httpMocks.createResponse();
    load(req11, res11);

    assert.strictEqual(res11._getStatusCode(), 400);
    assert.deepStrictEqual(res11._getData(),
        'did not provide a valid name');

    // Second branch, straight line code, error case (only one possible input)
    const req3 = httpMocks.createRequest({method: 'GET', url: '/api/load',
      query: {name: "B"}});
    const res3 = httpMocks.createResponse();
      load(req3, res3);

    assert.strictEqual(res3._getStatusCode(), 404);
    assert.deepStrictEqual(res3._getData(), 'no saved file of the given name exists');

    // third branch, successful load
    const req4 = httpMocks.createRequest({method: 'GET', url: '/api/load',
      query: {name: "A"}});
    const res4 = httpMocks.createResponse();
      load(req4, res4);

    assert.strictEqual(res4._getStatusCode(), 200);

    resetSavesForTesting();
  });

  it ('list', function(){
    // first branch, not valid name 
    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "A", value: "someA"}});
    const res1 = httpMocks.createResponse();
    save(req1, res1);

    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "B", value: "someB"}});
    const res2 = httpMocks.createResponse();
    save(req2, res2);

    const req11 = httpMocks.createRequest(
      {method: 'GET', url: '/api/list'});
    const res11 = httpMocks.createResponse();
    list(req11, res11);

    assert.strictEqual(res11._getStatusCode(), 200);
    assert.deepStrictEqual(res11._getData(),
        {savesList: ["A", "B"]});
      
    resetSavesForTesting();
  });
});
