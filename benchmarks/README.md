# Benchmarks

| Module                                                                       | Version | Requests/sec | Percentage |
| ---------------------------------------------------------------------------- | ------: | -----------: | ---------: |
| [Deno](https://github.com/danteissaias/fast/blob/0.0.19/benchmarks/deno.ts)  | 0.144.0 |    110411.23 |    100.00% |
| [Fast](https://github.com/fastrodev/fastro/blob/0.0.19/benchmarks/fastro.ts) |  0.19.0 |    108117.85 |     97.92% |

## Deno

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

## Fast

```
wrk -t12 -c400 -d30s http://127.0.0.1:8000
```

```
Running 30s test @ http://127.0.0.1:8000
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     3.66ms    1.06ms  57.87ms   94.60%
    Req/Sec     9.06k     1.26k   10.35k    90.03%
  3247303 requests in 30.03s, 470.72MB read
  Socket errors: connect 0, read 578, write 6, timeout 0
Requests/sec: 108117.85
Transfer/sec:     15.67MB
```
