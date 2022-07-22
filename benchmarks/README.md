# Benchmarks

| Module                                                                     | Version | Requests/sec | Percentage |
| -------------------------------------------------------------------------- | ------: | -----------: | ---------: |
| [Deno](https://github.com/danteissaias/fast/blob/3.4.0/benchmarks/deno.ts) | 0.147.0 |     91456.35 |    100.00% |
| [Oak](https://github.com/danteissaias/fast/blob/3.4.0/benchmarks/oak.ts)   | v10.6.0 |     53902.56 |     58.93% |
| [Fast](https://github.com/danteissaias/fast/blob/3.4.0/benchmarks/fast.ts) |   3.4.0 |     90661.79 |     99.13% |

## Deno

```
oha -z 30s http://localhost:8000
```

```
Summary:
  Success rate: 1.0000
  Total:        30.0008 secs
  Slowest:      0.0446 secs
  Fastest:      0.0001 secs
  Average:      0.0005 secs
  Requests/sec: 91456.3482

  Total data:   31.40 MiB
  Size/request: 12 B
  Size/sec:     1.05 MiB
```

## Oak

```
oha -z 30s http://localhost:8000
```

```
Summary:
  Success rate: 1.0000
  Total:        30.0008 secs
  Slowest:      0.0467 secs
  Fastest:      0.0002 secs
  Average:      0.0009 secs
  Requests/sec: 53902.5627

  Total data:   18.51 MiB
  Size/request: 12 B
  Size/sec:     631.67 KiB
```

## Fast

```
oha -z 30s http://localhost:8000
```

```
Summary:
  Success rate: 1.0000
  Total:        30.0007 secs
  Slowest:      0.0233 secs
  Fastest:      0.0001 secs
  Average:      0.0006 secs
  Requests/sec: 90661.7927

  Total data:   33.72 MiB
  Size/request: 13 B
  Size/sec:     1.12 MiB
```
