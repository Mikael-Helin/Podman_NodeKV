const {
    traverseJSON2HTML,
    traverseJSON2CSV,
    sendOKResponse,
    sendErrorResponse } = require('../dist/app.js');

const { JSDOM } = require('jsdom');

// convert

test('Testing traverseJSON2HTML with two items', () => {
    const input = { 
        msgJSON: { message: { items: [{key: 'key1', value: 'value1'}, {key: 'key2', value: 'value2'}]}}, 
        attributes: ['key', 'value']
    };
    const output = traverseJSON2HTML(input);
    const dom = new JSDOM(output);
    const rows = dom.window.document.querySelectorAll('tr');
    expect(rows.length).toBe(3); // Header row + 2 data rows
    expect(rows[1].textContent).toBe('key1value1');
    expect(rows[2].textContent).toBe('key2value2');
});

test('Testing traverseJSON2CSV with two items', () => {
    const input = { 
        msgJSON: { message: { items: [{key: 'key1', value: 'value1'}, {key: 'key2', value: 'value2'}]}}, 
        attributes: ['key', 'value']
    };
    const output = traverseJSON2CSV(input).trim();
    const rows = output.split('\n');
    expect(rows.length).toBe(3); // Header row + 2 data rows
    expect(rows[1]).toBe("\"key1\",\"value1\"");
    expect(rows[2]).toBe("\"key2\",\"value2\"");
});

// sendOKResponse

const mockEnd = jest.fn();
const mockWriteHead = jest.fn();

const res = {
  end: mockEnd,
  writeHead: mockWriteHead,
};

beforeEach(() => {
    mockEnd.mockReset();
    mockWriteHead.mockReset();
});

test('Testing sendOKResponse with JSON format', () => {
  const messageValue = "test_message";
  const format = "json";
  const attributes = ["KEY", "VALUE"];

  sendOKResponse({messageValue, res, format, attributes});

  expect(mockWriteHead.mock.calls.length).toBe(1);
  expect(mockWriteHead.mock.calls[0][0]).toBe(200);
  expect(mockWriteHead.mock.calls[0][1]).toEqual({'Content-Type': 'application/json'});

  expect(mockEnd.mock.calls.length).toBe(1);
  expect(mockEnd.mock.calls[0][0]).toBe(JSON.stringify({"status": "ok", "message": messageValue}));
});

test('Testing sendOKResponse with HTML format', () => {
    const messageValue = "test_message";
    const format = "html";
    const attributes = ["KEY", "VALUE"];
  
    sendOKResponse({messageValue, res, format, attributes});
  
    expect(mockWriteHead.mock.calls.length).toBe(1);
    expect(mockWriteHead.mock.calls[0][0]).toBe(200);
    expect(mockWriteHead.mock.calls[0][1]).toEqual({'Content-Type': 'text/html'});
  
    expect(mockEnd.mock.calls.length).toBe(1);
    expect(mockEnd.mock.calls[0][0]).toBe("<center><table width='80%'><tr><th>KEY</th><th>VALUE</th></tr><tr><td>status</td><td>ok</td></tr><tr><td>message</td><td>test_message</td></tr></table></center>");
});

// SendErrorResponse


test('Testing sendErrorResponse with JSON format', () => {
    const messageValue = "test_message";
    const format = "json";
    const attributes = ["KEY", "VALUE"];
  
    sendOKResponse({messageValue, res, format, attributes});
  
    expect(mockWriteHead.mock.calls.length).toBe(1);
    expect(mockWriteHead.mock.calls[0][0]).toBe(200);
    expect(mockWriteHead.mock.calls[0][1]).toEqual({'Content-Type': 'application/json'});
  
    expect(mockEnd.mock.calls.length).toBe(1);
    expect(mockEnd.mock.calls[0][0]).toBe(JSON.stringify({"status": "ok", "message": messageValue}));
  });
  
  test('Testing sendOKResponse with HTML format', () => {
      const messageValue = "test_message";
      const format = "html";
      const attributes = ["KEY", "VALUE"];
    
      sendOKResponse({messageValue, res, format, attributes});
    
      expect(mockWriteHead.mock.calls.length).toBe(1);
      expect(mockWriteHead.mock.calls[0][0]).toBe(200);
      expect(mockWriteHead.mock.calls[0][1]).toEqual({'Content-Type': 'text/html'});
    
      expect(mockEnd.mock.calls.length).toBe(1);
      expect(mockEnd.mock.calls[0][0]).toBe("<center><table width='80%'><tr><th>KEY</th><th>VALUE</th></tr><tr><td>status</td><td>ok</td></tr><tr><td>message</td><td>test_message</td></tr></table></center>");
  });
  