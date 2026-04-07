## Context

The closure table (`referral_ancestors`) stores a row for every ancestor-descendant pair, including a self-reference row per node with `depth = 0`. The current `findByUserId` query joins on `ra.ancestor_id = rt.user_id`, which always selects the self-reference row — so `depth` is always 0 regardless of the node's actual position in the tree.

`ReferralNode.create` correctly enforces that any node with a non-null `parentId` must have `depth > 0`, so the bug manifests as a 500 on the first registration beyond level 1.

## Goals / Non-Goals

**Goals:**
- `findByUserId` returns the correct tree depth (distance from root) for any node.
- No 500 error when loading level-2+ referral nodes.

**Non-Goals:**
- Changing the closure table schema.
- Modifying `ReferralNode` domain invariants.
- Any other query in the repository.

## Decisions

**Use `MAX(ra.depth)` grouped by node** instead of joining on the self-reference row.

In the closure table, `depth` represents the distance between `ancestor_id` and `descendant_id`. For a given descendant (the node we're loading), `MAX(depth)` across all its ancestor rows equals its distance from the root — because the root's row has the largest depth value.

```sql
SELECT rt.user_id, rt.parent_id, MAX(ra.depth) AS depth
FROM referral_tree rt
JOIN referral_ancestors ra ON ra.descendant_id = rt.user_id
WHERE rt.user_id = $1
GROUP BY rt.user_id, rt.parent_id
```

Alternative considered: filter `ra.ancestor_id = (SELECT user_id FROM referral_tree WHERE parent_id IS NULL)` to get the root-to-node row directly. Rejected because it requires a subquery, couples the query to root existence, and `MAX(depth)` is simpler and equally correct.

## Risks / Trade-offs

- [Risk] A node with no ancestors in `referral_ancestors` (data inconsistency) would return no rows → `findByUserId` returns `null`, not a crash. Acceptable behavior.
- No migration needed — the schema is unchanged.
