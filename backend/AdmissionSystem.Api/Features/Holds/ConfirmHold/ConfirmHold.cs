using System.Data;
using AdmissionSystem.Api.Common.Contracts;
using AdmissionSystem.Api.Common.Domain;
using AdmissionSystem.Api.Common.Persistence;
using AdmissionSystem.Api.Common.Validation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdmissionSystem.Api.Features.Holds.ConfirmHold;

public static class ConfirmHold
{
    public sealed record Response(string HoldId, string Status);

    public sealed class Handler(AdmissionDbContext db, ILogger<Handler> logger)
    {
        /*
        Purpose:
        Simulate admission-fee payment and confirm a non-expired HELD seat.

        Response:
        (Success, Result, Error, StatusCode) — idempotent if already CONFIRMED.

        Business Rules:
        - Owner student only
        - Idempotent confirm
        - Expired/cancelled cannot confirm

        Flow:
        1. Lock hold row
        2. Validate ownership/status/expiry
        3. Set CONFIRMED once

        Side Effects:
        Updates HoldEntity.Status

        Failure Cases:
        404/403/400 as mapped below
        */
        public async Task<(bool Success, Response? Result, string? Error, int StatusCode)> Handle(
            string holdId,
            string studentId,
            CancellationToken ct)
        {
            await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, ct);
            try
            {
                if (db.Database.IsRelational())
                {
                    await db.Database.ExecuteSqlInterpolatedAsync(
                        $"SELECT id FROM holds WHERE id = {holdId} FOR UPDATE", ct);
                }

                var hold = await db.Holds.FindAsync([holdId], ct);
                if (hold is null)
                {
                    await tx.RollbackAsync(ct);
                    return (false, null, "Hold not found.", 404);
                }

                if (hold.StudentId != studentId)
                {
                    await tx.RollbackAsync(ct);
                    return (false, null, "Hold belongs to a different student.", 403);
                }

                if (hold.Status == HoldStatus.Confirmed)
                {
                    await tx.CommitAsync(ct);
                    return (true, new Response(hold.Id, HoldStatus.Confirmed), null, 200);
                }

                if (hold.Status == HoldStatus.Cancelled)
                {
                    await tx.RollbackAsync(ct);
                    return (false, null, "Cancelled hold cannot be confirmed.", 400);
                }

                if (hold.Status != HoldStatus.Held || hold.ExpiresAt <= DateTime.UtcNow)
                {
                    if (hold.Status == HoldStatus.Held)
                    {
                        hold.Status = HoldStatus.Expired;
                        await db.SaveChangesAsync(ct);
                    }

                    await tx.CommitAsync(ct);
                    return (false, null, "Hold has expired and cannot be confirmed.", 400);
                }

                hold.Status = HoldStatus.Confirmed;
                await db.SaveChangesAsync(ct);
                await tx.CommitAsync(ct);
                return (true, new Response(hold.Id, HoldStatus.Confirmed), null, 200);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error confirming hold {HoldId}", holdId);
                await tx.RollbackAsync(ct);
                throw;
            }
        }
    }
}

[ApiController]
[Route("holds")]
[Tags("Holds")]
public sealed class ConfirmHoldEndpoint(ConfirmHold.Handler handler) : ControllerBase
{
    [HttpPost("{holdId}/confirm")]
    public async Task<IActionResult> Handle(
        string holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentId,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(holdId))
        {
            return BadRequest(new ErrorResponse("Hold ID is required."));
        }

        var normalized = StudentIdValidator.Normalize(studentId);
        if (normalized is null)
        {
            return BadRequest(new ErrorResponse(
                "Invalid or missing X-Student-Id header. Must be a 17-digit number."));
        }

        var (success, result, error, statusCode) = await handler.Handle(holdId, normalized, ct);
        return success
            ? Ok(result)
            : StatusCode(statusCode, new ErrorResponse(error ?? "Failed to confirm hold."));
    }
}
