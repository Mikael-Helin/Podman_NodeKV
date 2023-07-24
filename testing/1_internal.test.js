const { 
    isCleanSelector,
    areCleanSelectors,
    isCleanValue,
    isCleanList,
    isCleanTTL,
    pathExtract,
    isCleanPostBody,
    getSelectors,
    getKeys,
    connectDB,
    disconnectDB } = require('../dist/app.js');

beforeAll(async () => { await connectDB(); });

// isCleanSelector

test('Testing isCleanSelector with valid selectors', () => {
    const inputs = ["key", "value", "created", "updated", "last_active", "ttl", "active"];
    inputs.forEach(input => {
        const expected_output = true;
        const output = isCleanSelector(input);
        expect(output).toBe(expected_output);
    });
});

test('Testing isCleanSelector with invalid selectors, empty and non-string types', () => {
    const inputs = ["*", "valu", "", null, undefined, true, false, 99, "$£$đ", [], {}];
    inputs.forEach(input => {
        const expected_output = false;
        const output = isCleanSelector(input);
        expect(output).toBe(expected_output);
    });
});

test('Testing isCleanSelector with leading/trailing white spaces', () => {
    const input = " key ";
    const expected_output = false;
    const output = isCleanSelector(input);
    expect(output).toBe(expected_output);
});

test('Testing isCleanSelector with case sensitivity', () => {
    const input = "KEY";
    const expected_output = false;
    const output = isCleanSelector(input);
    expect(output).toBe(expected_output);
});

// areCleanSelectors

test('Testing areCleanSelectors with multiple valid selectors', () => {
    const input = "key,value,created,updated";
    const expected_output = true;
    const output = areCleanSelectors(input);
    expect(output).toBe(expected_output);
});

test('Testing areCleanSelectors with both valid and invalid selectors', () => {
    const input = "key,value,created,invalidSelector";
    const expected_output = false;
    const output = areCleanSelectors(input);
    expect(output).toBe(expected_output);
});

// isCleanValue

test('Testing isCleanValue with valid, empty, convertible and list of values', () => {
    const inputs = ["", "Hello_123", "_-(@),.,.,~::;;***", null, undefined, 33, 0.5, true, false, [], ["https://www.mikaelhelin.com", 9, false, [], "mikael.helin@yahoo.com"], [[[[[[[[[[[]]]]]]]]]]]];
    inputs.forEach(input => {
        const expected_output = true;
        const output = isCleanValue(input);
        expect(output).toBe(expected_output);
    });
});

test('Testing isCleanValue with space, dictionary and backslash', () => {
    const inputs = [" ", {}, "\\"];
    inputs.forEach(input => {
        const expected_output = false;
        const output = isCleanValue(input);
        expect(output).toBe(expected_output);
    });
});

test('Testing isCleanValue with very long string', () => {
    let input = "a".repeat(1000000);
    const expected_output = true;
    const output = isCleanValue(input);
    expect(output).toBe(expected_output);
});

// isCleanList

test('Testing isCleanList with a list of valid values', () => {
    const input = ["Hello", "_123", "-(@),.,.,~::;;***"];
    const expected_output = true;
    const output = isCleanList(input);
    expect(output).toBe(expected_output);
});

test('Testing isCleanList with both valid and invalid values', () => {
    const input = ["Hello", "_123", "Invalid Value", "-(@),.,.,~::;;***"];
    const expected_output = false;
    const output = isCleanList(input);
    expect(output).toBe(expected_output);
});

// isCleanTTL

test('Testing isCleanTTL with non-negative integers', () => {
    const inputs = [0, 1, 2, 123456789, 1.000, "0", "1", "1.00"];
    inputs.forEach(input => {
        const expected_output = true;
        const output = isCleanTTL(input);
        expect(output).toBe(expected_output);
    });
});

test('Testing isCleanTTL with negative integers', () => {
    const inputs = [-1, -99];
    inputs.forEach(input => {
        const expected_output = false;
        const output = isCleanTTL(input);
        expect(output).toBe(expected_output);
    });
});

test('Testing isCleanTTL with wrong type', () => {
    const inputs = [true, false, null, undefined, "", [], [1,2]];
    inputs.forEach(input => {
        const expected_output = false;
        const output = isCleanTTL(input);
        expect(output).toBe(expected_output);
    });
});

test('Testing isCleanTTL with negative integers', () => {
    const inputs = [-1, -99, -0.0000001];
    inputs.forEach(input => {
        const expected_output = false;
        const output = isCleanTTL(input);
        expect(output).toBe(expected_output);
    });
});

test('Testing isCleanTTL with floating point numbers', () => {
    const inputs = [0.5, 1.1, -0.1];
    inputs.forEach(input => {
        const expected_output = false;
        const output = isCleanTTL(input);
        expect(output).toBe(expected_output);
    });
});

// pathExtract

test('Testing pathExtract with "/" path', () => {
    const input = "/";
    const expected_output = ["", []];
    const output = pathExtract(input);
    expect(output).toEqual(expected_output);
});

test('Testing pathExtract with undefined', () => {
    const input = undefined;
    const expected_output = ["", []];
    const output = pathExtract(input);
    expect(output).toEqual(expected_output);
});

test('Testing pathExtract with empty string', () => {
    const input = "";
    const expected_output = ["", []];
    const output = pathExtract(input);
    expect(output).toEqual(expected_output);
});

test('Testing pathExtract with string not starting with "/"', () => {
    const input = "some/path/";
    const expected_output = ["invalid", []];
    const output = pathExtract(input);
    expect(output).toEqual(expected_output);
});

test('Testing pathExtract with single "/" in the path', () => {
    const input = "/singlePath";
    const expected_output = ["singlePath", []];
    const output = pathExtract(input);
    expect(output).toEqual(expected_output);
});

test('Testing pathExtract with multiple "/" in the path', () => {
    const input = "/multiple/path/segments";
    const expected_output = ["multiple", ["path", "segments"]];
    const output = pathExtract(input);
    expect(output).toEqual(expected_output);
});

test('Testing pathExtract with trailing "/" in the path', () => {
    const input = "/trailing/";
    const expected_output = ["trailing", []];
    const output = pathExtract(input);
    expect(output).toEqual(expected_output);
});

test('Testing pathExtract with multiple "/" in the path', () => {
    const input = "///trailing////";
    const expected_output = ["", ["", "trailing", "", "", ""]];
    const output = pathExtract(input);
    expect(output).toEqual(expected_output);
});

// isCleanPostBody

test('Testing isCleanPostBody with invalid JSON', () => {
    const input = "{not a json string}";
    const expected_output = "Invalid JSON in request body, could not parse string";
    const output = isCleanPostBody(input);
    expect(output).toBe(expected_output);
});

test('Testing isCleanPostBody with a valid JSON array', () => {
    const input = JSON.stringify(["Hello", "_123", "-(@),.,.,~::;;***"]);
    const expected_output = ""; // clean
    const output = isCleanPostBody(input);
    expect(output).toBe(expected_output);
});

test('Testing isCleanPostBody with an invalid JSON array', () => {
    const input = JSON.stringify(["Hello", "_123", "Invalid Value", "-(@),.,.,~::;;***"]);
    const expected_output = "Invalid array in request body";
    const output = isCleanPostBody(input);
    expect(output).toBe(expected_output);
});

test('Testing isCleanPostBody with a valid JSON object', () => {
    const input = JSON.stringify({ key: { value: "Hello", ttl: 1000 } });
    const expected_output = ""; // clean
    const output = isCleanPostBody(input);
    expect(output).toBe(expected_output);
});

test('Testing isCleanPostBody with an invalid JSON object key', () => {
    const input = JSON.stringify({ "Invalid Key": { value: "Hello", ttl: 1000 } });
    const expected_output = "Invalid character in key, TTL or value";
    const output = isCleanPostBody(input);
    expect(output).toBe(expected_output);
});

test('Testing isCleanPostBody with an invalid JSON object value', () => {
    const input = JSON.stringify({ key: { value: "Invalid Value", ttl: 1000 } });
    const expected_output = "Invalid character in key, TTL or value";
    const output = isCleanPostBody(input);
    expect(output).toBe(expected_output);
});

test('Testing isCleanPostBody with an invalid JSON object ttl', () => {
    const input = JSON.stringify({ key: { value: "Hello", ttl: -1 } });
    const expected_output = "Invalid character in key, TTL or value";
    const output = isCleanPostBody(input);
    expect(output).toBe(expected_output);
});

// getSelectors

test('Testing getSelectors with undefined', () => {
    const input = undefined;
    const expected_output = "*";
    const output = getSelectors(input);
    expect(output).toBe(expected_output);
});

test('Testing getSelectors with empty string', () => {
    const input = "";
    const expected_output = "*";
    const output = getSelectors(input);
    expect(output).toBe(expected_output);
});

test('Testing getSelectors with "*"', () => {
    const input = "*";
    const expected_output = "*";
    const output = getSelectors(input);
    expect(output).toBe(expected_output);
});

test('Testing getSelectors with clean selectors in arbitrary order', () => {
    const input = "updated,key,value,created";
    const expected_output = "key,value,created,updated";
    const output = getSelectors(input);
    expect(output).toBe(expected_output);
});

test('Testing getSelectors with unclean selectors', () => {
    const input = "key,value,invalidSelector,updated";
    const expected_output = "key,value,updated"; // removes unclean selector and returns rest in correct order
    const output = getSelectors(input);
    expect(output).toBe(expected_output);
});

// getKeys

test('Testing getKeys with undefined httpBody and non-empty query_keys_list', () => {
    const input = { httpBody: undefined, query_keys_list: ["key1", "key2"], path_keys_list: ["keyA", "keyB"] };
    const expected_output = ["key1", "key2"];
    const output = getKeys(input);
    expect(output).toEqual(expected_output);
});

test('Testing getKeys with empty httpBody and non-empty query_keys_list', () => {
    const input = { httpBody: "", query_keys_list: ["key1", "key2"], path_keys_list: ["keyA", "keyB"] };
    const expected_output = ["key1", "key2"];
    const output = getKeys(input);
    expect(output).toEqual(expected_output);
});

test('Testing getKeys with empty object httpBody and non-empty query_keys_list', () => {
    const input = { httpBody: "{}", query_keys_list: ["key1", "key2"], path_keys_list: ["keyA", "keyB"] };
    const expected_output = ["key1", "key2"];
    const output = getKeys(input);
    expect(output).toEqual(expected_output);
});

test('Testing getKeys with empty array httpBody and non-empty query_keys_list', () => {
    const input = { httpBody: "[]", query_keys_list: ["key1", "key2"], path_keys_list: ["keyA", "keyB"] };
    const expected_output = ["key1", "key2"];
    const output = getKeys(input);
    expect(output).toEqual(expected_output);
});

test('Testing getKeys with empty httpBody and empty query_keys_list', () => {
    const input = { httpBody: "", query_keys_list: [], path_keys_list: ["keyA", "keyB"] };
    const expected_output = ["keyA", "keyB"];
    const output = getKeys(input);
    expect(output).toEqual(expected_output);
});

test('Testing getKeys with JSON array httpBody', () => {
    const input = { httpBody: '["keyX", "keyY"]', query_keys_list: ["key1", "key2"], path_keys_list: ["keyA", "keyB"] };
    const expected_output = ["keyX", "keyY"];
    const output = getKeys(input);
    expect(output).toEqual(expected_output);
});

test('Testing getKeys with JSON non-array httpBody', () => {
    const input = { httpBody: '{"keyZ":"valueZ"}', query_keys_list: ["key1", "key2"], path_keys_list: ["keyA", "keyB"] };
    const expected_output = ["key1", "key2"];
    const output = getKeys(input);
    expect(output).toEqual(expected_output);
});


afterAll(async () => { await disconnectDB(); });
