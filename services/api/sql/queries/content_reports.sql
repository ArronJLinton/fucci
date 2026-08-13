-- name: CreateContentReport :one
INSERT INTO content_reports (
    reporter_id,
    reportable_type,
    reportable_id,
    reported_user_id,
    reason,
    description
) VALUES (
    sqlc.arg(reporter_id),
    sqlc.arg(reportable_type),
    sqlc.arg(reportable_id),
    sqlc.narg(reported_user_id),
    sqlc.arg(reason),
    sqlc.narg(description)
)
RETURNING *;

-- name: ListPendingContentReports :many
SELECT *
FROM content_reports
WHERE status = 'pending'
ORDER BY created_at ASC
LIMIT sqlc.arg(row_limit);

-- name: GetContentReportByID :one
SELECT * FROM content_reports WHERE id = sqlc.arg(id);

-- name: UpdateContentReportStatus :one
UPDATE content_reports
SET status = sqlc.arg(status)
WHERE id = sqlc.arg(id)
RETURNING *;
