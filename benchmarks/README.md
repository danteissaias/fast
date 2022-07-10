# Benchmarks

| Module                                                                     | Version | Requests/sec | Percentage |
| -------------------------------------------------------------------------- | ------: | -----------: | ---------: |
| [Deno](https://github.com/danteissaias/fast/blob/3.0.0/benchmarks/deno.ts) | 0.147.0 |    111944.02 |    100.00% |
| [Oak](https://github.com/danteissaias/fast/blob/3.0.0/benchmarks/oak.ts)   | v10.6.0 |     58367.67 |      52.1% |
| [Fast](https://github.com/danteissaias/fast/blob/3.0.0/benchmarks/fast.ts) |   3.0.0 |    111706.82 |     99.78% |

## Deno

```
wrk -t12 -c400 -d30s http://127.0.0.1:8000
```

```
Running 30s test @ http://127.0.0.1:8000
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     2.14ms    0.90ms  59.72ms   97.45%
    Req/Sec     9.38k     4.01k   16.61k    62.44%
  3362126 requests in 30.03s, 484.16MB read
  Socket errors: connect 155, read 176, write 0, timeout 0
Requests/sec: 111944.02
Transfer/sec:     16.12MB
```

## Oak

```
wrk -t12 -c400 -d30s http://127.0.0.1:8000
```

```
Running 30s test @ http://127.0.0.1:8000
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     4.14ms    1.52ms 106.66ms   98.91%
    Req/Sec     4.89k     1.49k    8.33k    67.00%
  1752523 requests in 30.03s, 254.04MB read
  Socket errors: connect 155, read 325, write 0, timeout 0
Requests/sec:  58367.67
Transfer/sec:      8.46MB
```

## Fast

```
wrk -t12 -c400 -d30s http://127.0.0.1:8000
```

```
Running 30s test @ http://127.0.0.1:8000
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     2.13ms  686.66us  62.14ms   98.40%
    Req/Sec     9.36k     3.87k   24.67k    59.11%
  3354951 requests in 30.03s, 486.33MB read
  Socket errors: connect 155, read 165, write 0, timeout 0
Requests/sec: 111706.82
Transfer/sec:     16.19MB
```
