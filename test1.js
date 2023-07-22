const KeyValueStore = require('./app.js');  // adjust path to your KeyValueStore class
const store = new KeyValueStore();  // or however you initialize your store

test('KeyValueStore put and get', () => {
    // Setup
    const key = 'testKey';
    const value = 'testValue';

    // Exercise
    store.put(key, value);
    const result = store.get(key);

    // Verify
    expect(result).toBe(value);
});

