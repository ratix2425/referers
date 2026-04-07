## Why

When a level-2 (or deeper) referral registers, the system throws a 500 error because `PostgresReferralTreeRepository.findByUserId` retrieves the self-reference row from the closure table (`ancestor_id = user_id`), which always has `depth = 0`, causing `ReferralNode.create` to reject a node that has a `parentId` but `depth === 0`.

## What Changes

- Fix the SQL query in `findByUserId` to compute the node's actual tree depth (its distance from the root) instead of reading the self-reference depth from `referral_ancestors`.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `referral-tree`: The depth value returned when loading an existing node must reflect its position in the tree (distance from root), not the closure-table self-reference row (always 0).

## Impact

- `src/modules/referral/infrastructure/repositories/PostgresReferralRepository.ts` — `findByUserId` query updated.
- No schema or API changes; purely an internal query fix.
