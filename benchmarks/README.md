# Benchmarks

| Module                                                                     | Version | Requests/sec | Percentage |
| -------------------------------------------------------------------------- | ------: | -----------: | ---------: |
| [Deno](https://github.com/danteissaias/fast/blob/2.0.0/benchmarks/deno.ts) | 0.147.0 |    119542.59 |    100.00% |
| [Oak](https://github.com/danteissaias/fast/blob/2.0.0/benchmarks/oak.ts)   | v10.6.0 |     56283.40 |     47.08% |
| [Fast](https://github.com/danteissaias/fast/blob/2.0.0/benchmarks/fast.ts) |   2.0.0 |    115107.40 |     96.28% |

## Deno

```
wrk -t12 -c400 -d30s http://127.0.0.1:8000
```

```
Running 30s test @ http://127.0.0.1:8000
  12 threads and 400 connections

  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     1.99ms  637.24us  60.09ms   96.50%
    Req/Sec    10.02k     2.97k   20.78k    57.69%
  3590233 requests in 30.03s, 517.01MB read
  Socket errors: connect 155, read 183, write 0, timeout 0
Requests/sec: 119542.50
Transfer/sec:     17.21MB
```

## Oak

```
wrk -t12 -c400 -d30s http://127.0.0.1:8000
```

```
Running 30s test @ http://127.0.0.1:8000
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     4.33ms    2.00ms 110.02ms   98.35%
    Req/Sec     4.72k     2.18k    8.33k    50.11%
  1692038 requests in 30.06s, 245.28MB read
  Socket errors: connect 155, read 361, write 0, timeout 0
Requests/sec:  56283.22
Transfer/sec:      8.16MB
```

## Fast

```
wrk -t12 -c400 -d30s http://127.0.0.1:8000
```

```
Running 30s test @ http://127.0.0.1:8000
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     2.07ms  686.19us  61.69ms   98.75%
    Req/Sec     9.64k     4.11k   18.05k    57.69%
  3456532 requests in 30.03s, 501.05MB read
  Socket errors: connect 155, read 148, write 0, timeout 0
Requests/sec: 115107.31
Transfer/sec:     16.69MB
```
