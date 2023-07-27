const {
    traverseJSON2HTML,
    traverseJSON2CSV,
    sendOKResponse,
    sendErrorResponse,
    handleDataStream } = require("../dist/app.js");

const { JSDOM } = require("jsdom");

// convert

test("Testing traverseJSON2HTML with two items", () => {
    const msgJSON = { message: { items: [{key: "key1", value: "value1"}, {key: "key2", value: "value2"}]}}
    const attributes_list = ["key", "value"];
    const input = {msgJSON, attributes_list}
    const output = traverseJSON2HTML(input);
    const dom = new JSDOM(output);
    const rows = dom.window.document.querySelectorAll("tr");
    expect(rows.length).toBe(3); // Header row + 2 data rows
    expect(rows[1].textContent).toBe("key1value1");
    expect(rows[2].textContent).toBe("key2value2");
});

test("Testing traverseJSON2CSV with two items", () => {
    const input = { 
        msgJSON: { message: { items: [{key: "key1", value: "value1"}, {key: "key2", value: "value2"}]}}, 
        attributes_list: ["key", "value"]
    };
    const output = traverseJSON2CSV(input).trim();
    const rows = output.split("\n");
    expect(rows.length).toBe(3); // Header row + 2 data rows
    expect(rows[1]).toBe("\"key1\",\"value1\"");
    expect(rows[2]).toBe("\"key2\",\"value2\"");
});

// Prepare mocks

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

// sendOKResponse

test("Testing sendOKResponse with JSON format", () => {
  const msgString = "test_message";
  const format = "json";
  const attributes = ["KEY", "VALUE"];

  sendOKResponse({msgString, res, format, attributes});

  expect(mockWriteHead.mock.calls.length).toBe(1);
  expect(mockWriteHead.mock.calls[0][0]).toBe(200);
  expect(mockWriteHead.mock.calls[0][1]).toEqual({"Content-Type": "application/json"});

  expect(mockEnd.mock.calls.length).toBe(1);
  expect(mockEnd.mock.calls[0][0]).toBe(JSON.stringify({"status": "ok", "message": msgString}));
});

test("Testing sendOKResponse with HTML format", () => {
    const msgString = "test_message";
    const format = "html";
    const attributes = ["KEY", "VALUE"];
  
    sendOKResponse({msgString, res, format, attributes});
  
    expect(mockWriteHead.mock.calls.length).toBe(1);
    expect(mockWriteHead.mock.calls[0][0]).toBe(200);
    expect(mockWriteHead.mock.calls[0][1]).toEqual({"Content-Type": "text/html"});
  
    expect(mockEnd.mock.calls.length).toBe(1);
    expect(mockEnd.mock.calls[0][0]).toBe("<center><table width='80%'><tr><th>KEY</th><th>VALUE</th></tr><tr><td>status</td><td>ok</td></tr><tr><td>message</td><td>test_message</td></tr></table></center>");
});

// SendErrorResponse

let statusCode = 400;

test("Testing sendErrorResponse with JSON format", () => {
    const msgString = "test_message";
    const format = "json";
    const attributes = ["KEY", "VALUE"];
  
    sendErrorResponse({statusCode, msgString, res, format, attributes});
  
    expect(mockWriteHead.mock.calls.length).toBe(1);
    expect(mockWriteHead.mock.calls[0][0]).toBe(statusCode);
    expect(mockWriteHead.mock.calls[0][1]).toEqual({"Content-Type": "application/json"});
  
    expect(mockEnd.mock.calls.length).toBe(1);
    expect(mockEnd.mock.calls[0][0]).toBe(JSON.stringify({"status": "error", "message": msgString}));
});
  
test("Testing sendErrorResponse with HTML format", () => {
    const msgString = "test_message";
    const format = "html";
    const attributes = ["KEY", "VALUE"];

    sendErrorResponse({statusCode, msgString, res, format, attributes});

    expect(mockWriteHead.mock.calls.length).toBe(1);
    expect(mockWriteHead.mock.calls[0][0]).toBe(statusCode);
    expect(mockWriteHead.mock.calls[0][1]).toEqual({"Content-Type": "text/html"});

    expect(mockEnd.mock.calls.length).toBe(1);
    expect(mockEnd.mock.calls[0][0]).toBe("<center><table width='80%'><tr><th>KEY</th><th>VALUE</th></tr><tr><td>status</td><td>error</td></tr><tr><td>message</td><td>test_message</td></tr></table></center>");
});

// handleDataStream

const EventEmitter = require("events");

test("Testing handleDataStream function", async () => {
    const req = new EventEmitter(); // Mock the req object with relevant functions
    const dataPromise = handleDataStream(req); // Set up a promise to capture the result of handleDataStream

    req.emit("data", "This ");
    req.emit("data", "is ");
    req.emit("data", "a ");
    req.emit("data", "test");
    req.emit("end");

    const result = await dataPromise; // Wait for the handleDataStream promise to resolve
    expect(result).toBe("This is a test");
});

test("Testing handleDataStream function with error event", async () => {
    expect.assertions(1);
    const req = new EventEmitter();
    const dataPromise = handleDataStream(req).catch(e => expect(e.message).toBe("Test error"));
    req.emit("error", new Error("Test error")); // Emit "error" event
});
