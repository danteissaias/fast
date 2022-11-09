#!/bin/sh

rm -rf cov_profile
deno test -A --coverage=cov_profile
deno coverage cov_profile --lcov > cov_profile.lcov
deno coverage cov_profile