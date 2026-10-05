import { ingest, benchmark, visualize } from 'evaa-engine';

const file = '/tmp/sample.parquet';

console.log('1) API calls EVAA Engine');
console.log(ingest(file));
console.log(await benchmark(file));
console.log(visualize(file));
