const { handleSelectResponse } = require("../dist/app.js");

test('handleSelectResponse with error', () => {
    const err = new Error('Test error');
    const rows = [
        {key: 'key1', value: 'value1', created: 'time1', updated: 'time2', ttl: 1000, last_active: 'time3', active: 1},
        {key: 'key2', value: 'value2', created: 'time4', updated: 'time5', ttl: 2000, last_active: 'time6', active: 1}
    ];
    const res = { writeHead: jest.fn(), end: jest.fn() };
    const format = "json";
    const attributes = ["key", "value"];

    handleSelectResponse({err, rows, res, format, attributes});

    expect(res.writeHead).toHaveBeenCalledWith(500, { 'Content-Type': 'application/json' });
});

test('handleSelectResponse with error 2', () => {
    const err = new Error('Test error');
    const rows = [
        {key: 'key1', value: 'value1', created: 'time1', updated: 'time2', ttl: 1000, last_active: 'time3', active: 1},
        {key: 'key2', value: 'value2', created: 'time4', updated: 'time5', ttl: 2000, last_active: 'time6', active: 1}
    ];
    let responseBody;
    const res = { 
        writeHead: jest.fn(), 
        end: jest.fn().mockImplementation((data) => { responseBody = data; }) 
    };
    const format = "json";
    const attributes = ["key", "value"];

    handleSelectResponse({err, rows, res, format, attributes});

    expect(res.writeHead).toHaveBeenCalledWith(500, { 'Content-Type': 'application/json' });

    // The response body should be a JSON string, parse it back to an object
    const responseBodyObj = JSON.parse(responseBody);
    expect(responseBodyObj).toHaveProperty('message', `Failed with SQL query: ${err.message}`);
});