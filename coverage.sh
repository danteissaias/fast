#!/bin/sh

deno test --unstable --coverage=cov_profile
deno coverage cov_profile --lcov > cov_profile.lcov