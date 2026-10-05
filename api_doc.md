# 1. API health
curl http://localhost:3008/api/status

# 2. CSV
curl -X POST -F "file=@../evaa-engine/test/sample.csv" \
  http://localhost:3008/api/ingest

# 3. NPY
curl -X POST -F "file=@../evaa-engine/test/sample.npy" \
  http://localhost:3008/api/ingest

# 4. MAT
curl -X POST -F "file=@../evaa-engine/test/sample.mat" \
  http://localhost:3008/api/ingest

# 5. TXT
curl -X POST -F "file=@../evaa-engine/test/test_events.txt" \
  http://localhost:3008/api/ingest