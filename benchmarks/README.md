# Benchmarks

| Module                                                                      | Version | Requests/sec | Percentage |
| --------------------------------------------------------------------------- | ------: | -----------: | ---------: |
| [Deno](https://github.com/danteissaias/fast/blob/0.0.21/benchmarks/deno.ts) | 0.144.0 |    110411.23 |    100.00% |
| [Fast](https://github.com/danteissaias/fast/blob/0.0.21/benchmarks/fast.ts) |  0.0.22 |    108117.85 |     99.49% |

## Deno

```
wrk -t12 -c400 -d30s http://127.0.0.1:8000
```

```
Running 30s test @ http://127.0.0.1:8000
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     3.54ms    0.91ms  62.66ms   94.38%
    Req/Sec     9.30k     1.10k   14.54k    89.44%
  3333791 requests in 30.04s, 483.26MB read
  Socket errors: connect 0, read 631, write 0, timeout 0
Requests/sec: 110969.25
Transfer/sec:     16.09MB
```

## Fast

```
wrk -t12 -c400 -d30s http://127.0.0.1:8000
```

```
Running 30s test @ http://127.0.0.1:8000
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     3.55ms    0.89ms  68.89ms   95.98%
    Req/Sec     9.25k     0.95k   11.89k    89.39%
  3316368 requests in 30.04s, 480.74MB read
  Socket errors: connect 0, read 489, write 1, timeout 0
Requests/sec: 110411.23
Transfer/sec:     16.01MB
```