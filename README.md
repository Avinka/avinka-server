## Backend app commands ##

````bash
yarn start-debug
````

### Activity queries ###

```bash
curl -d '{"actor":{"id":"P:123","type":"Person"},"object":{"id":"Bot:123","type":"Bot"},"type":"Login"}' -H "Content-Type: application/json" -X POST http://localhost:3000/activity
curl -X GET "localhost:3000/activity" -H 'Content-Type: application/json' -d'{"query": {"match_all": {}}}'


curl -X GET "localhost:3000/activity" -H 'Content-Type: application/json' -d '{"query":{"match":{"object.type":{"query":"Bot","operator":"OR","prefix_length":0,"max_expansions":50,"fuzzy_transpositions":true,"lenient":false,"zero_terms_query":"NONE","auto_generate_synonyms_phrase_query":true,"boost":1}}}}'

curl -X GET "localhost:3000/activity" -H 'Content-Type: application/json' -d '{"query":{"match":{"object.type":{"query":"Bot","operator":"OR","prefix_length":0,"max_expansions":50,"fuzzy_transpositions":true,"lenient":false,"zero_terms_query":"NONE","auto_generate_synonyms_phrase_query":true,"boost":1}}},"_source":false,"aggregations":{"grouping":{"date_histogram":{"field":"published","interval":3600000,"offset":0,"order":{"_key":"asc"},"keyed":false,"min_doc_count":0}}}}
'

```

### Counter queries ###

```bash
curl -X GET "localhost:3000/counter" -H 'Content-Type: application/json' -d '{"match":{"object.type":{"query":"Bot"}}}'
```

### Dataseries query ###

```bash
curl -X GET "localhost:3000/counter" -H 'Content-Type: application/json' -d '{"match":{"object.type":{"query":"Bot"}}}'
```

### Admin queries ###

```bash
curl -X GET "localhost:3000/admin/generateData"
curl -X GET "localhost:3000/admin/deleteData"
```

### Dashboard queries ###

```bash
curl "http://localhost:3000/dashboardApi/"
curl "http://localhost:3000/dashboardApi" -XPOST -d'{"name":"test"}' -H'content-type:application/json'
curl "http://localhost:3000/dashboardApi/5bb33aabd23dba7c102e8d0c/"
curl "http://localhost:3000/dashboardApi/5bb33aabd23dba7c102e8d0c/graph"
curl "http://localhost:3000/dashboardApi/5bb33aabd23dba7c102e8d0c/graph" -XPOST -d'{"_id":"5bb3551d42c7b37eb28e7ad5"}' -H'content-type:application/json'
```

### Graph queries ###

```bash
curl "http://localhost:3000/graph"
curl "http://localhost:3000/graph" -XPOST -d'{"name":"test"}' -H'content-type:application/json'
curl "http://localhost:3000/graph/5bb3552042c7b37eb28e7ad7"
curl "http://localhost:3000/graph/5bb3552042c7b37eb28e7ad7/dataseriesApi"
curl "http://localhost:3000/graph/5bb3552042c7b37eb28e7ad7/graph" -XPOST -d'{"_id":"5bb3551d42c7b37eb28e7ad5"}' -H'content-type:application/json'
```
