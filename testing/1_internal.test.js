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
    traverseJSON2HTML,
    traverseJSON2CSV,
    connectDB,
    disconnectDB } = require('../dist/app.js');

beforeAll(async () => { await connectDB(); });
  
test('KeyValueStore test isCleanSelector', () => {
    const inputs = ["key", "value", "created", "updated", "last_active", "ttl", "active"];
    inputs.forEach(input => {
        const expected_output = true;
        const output = isCleanSelector(input);
        expect(output).toBe(expected_output);
    });
});

afterAll(async () => { await disconnectDB(); });