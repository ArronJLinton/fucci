-- name: CreateUserBlock :one
INSERT INTO user_blocks (blocker_id, blocked_user_id)
VALUES (sqlc.arg(blocker_id), sqlc.arg(blocked_user_id))
RETURNING *;

-- name: DeleteUserBlock :exec
DELETE FROM user_blocks
WHERE blocker_id = sqlc.arg(blocker_id)
  AND blocked_user_id = sqlc.arg(blocked_user_id);

-- name: GetUserBlock :one
SELECT * FROM user_blocks
WHERE blocker_id = sqlc.arg(blocker_id)
  AND blocked_user_id = sqlc.arg(blocked_user_id);

-- name: ListBlockedUserIDs :many
SELECT blocked_user_id
FROM user_blocks
WHERE blocker_id = sqlc.arg(blocker_id);
