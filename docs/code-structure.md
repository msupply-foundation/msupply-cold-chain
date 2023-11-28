## Code Structure, and things you need to know!

This applications uses [Saga's](https://redux-saga.js.org/) to manage concurrent functionality in the application, including for updating the UI state.

This pattern isn't common now days, so some explanations might be helpful.

## Generator Functions

When working with this app, you'll see a lot of javascript `function*` definitions.

The `*` means that this is a [generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) function, which means that instead of the function returning with a single value, it can `yield` returning a value, and can be called again to return the next value.

A classic example of this is a function that generates the next number in the fibonacci sequence:

```typescript
function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    [prev, curr] = [curr, prev + curr];
    yield curr;
  }
}
```

This function can run indefinitely, and each time it is called, it will return the next number in the sequence.

To use the function, you first need to create an instance of the generator:

```typescript
const fib = fibonacci();
```

Then you can call the function to get the next value:

```typescript
fib.next(); // { value: 1, done: false }
```

Inside sagas, these `next()` calls are automated using functions like `takeEvery` and `takeLatest`.
It's important to note, that even though you're calling yield in your function, it's not inherently running concurrently, the saga waits for the returned value before continuing the execution of that function.

> Note: if the `yield` keyword is used to return a value from an API call, the function will wait for the API response before continuing e.g. you probably want to make sure you have a timeout set, otherwise the saga could wait forever and never do any more work...

### Sagas

Sagas are effectively independently operating groups of generator functions, and use messages to decide which actions to take, and send messages to other sagas.

For example this saga would listen to each `NEXT_FIB_REQUESTED` action, and call the `fibonacci` generator function to get the next value.

```typescript
function* watchForFibonacci() {
  yield takeEvery('NEXT_FIB_REQUESTED', fibonacci);
}
```

> Note This wouldn't really do anything useful, as the saga would call the `fibonacci` function, but it does do anything with the result. For it to do something, you'd probably need to have a fibonacci function which puts some state into the `store` or dispatch an action to update the state.

### Reducers & Slices

This application relies heavily on `Reducers` and `Slices`.

### Root Saga

```typescript
export function* RootSaga(): SagaIterator {
  yield fork(EntitiesSaga.root);
  yield fork(ChartSaga.root);
  yield fork(BreachSaga.root);
  yield fork(SensorDetailSaga.root);
  yield fork(BluetoothSaga.root);
  yield fork(ReportSaga.root);
  yield fork(SensorStatusSaga.root);
  yield fork(PermissionSaga.root);
  yield fork(SyncSaga.root);
  yield fork(DevSaga.root);
  yield fork(HydrateSaga.root);
  yield fork(MonitorSaga.root);
}
```

### EntitiesSaga

This is used to manage Configuration of Sensors, Settings, and Breach Configuration.

### ChartSaga

This is used to manage the chart data (including database queries), and the chart configuration.
