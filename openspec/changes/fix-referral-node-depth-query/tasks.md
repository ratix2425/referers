## 1. Fix Query

- [x] 1.1 Replace the `findByUserId` SQL in `PostgresReferralTreeRepository` with `MAX(ra.depth) GROUP BY` to return the node's actual tree depth instead of the self-reference row depth

## 2. Test Coverage

- [x] 2.1 Add integration test for `findByUserId` returning `depth = 2` for a level-2 node (regression for the 500 error)
