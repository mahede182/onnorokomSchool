using System.Data;
using AdmissionSystem.Api.Common.Config;
using AdmissionSystem.Api.Common.Contracts;
using AdmissionSystem.Api.Common.Domain;
using AdmissionSystem.Api.Common.Persistence;
using AdmissionSystem.Api.Common.Time;
using AdmissionSystem.Api.Common.Validation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdmissionSystem.Api.Features.Holds.CreateHold;

public static class CreateHold
{
    public sealed record Response(
        string HoldId,
        string ClassId,
        string StudentId,
        string Status,
        string ExpiresAt);

    public sealed class Handler(
        AdmissionDbContext db,
        IConfiguration configuration,
        ILogger<Handler> logger)
    {

        /*
        Purpose:
        Place a seat hold for a student on a class under concurrency-safe locking.

        Response:
        (Success, Hold, ErrorReason, StatusCode)

        Business Rules:
        - SELECT FOR UPDATE on class row
        - One active hold/confirm per student per class
        - held + confirmed never exceeds totalSeats

        Flow:
        1. Begin transaction + lock class
        2. Validate class / student conflict / capacity
        3. Insert HELD hold with expiry
        4. Commit

        Side Effects:
        Inserts HoldEntity

        Failure Cases:
        404 class missing; 409 full or duplicate student; throws on unexpected DB errors
        */
        public async Task<(bool Success, Response? Hold, string? Error, int StatusCode)> Handle(
            string classId,
            string studentId,
            CancellationToken ct)
        {
            await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, ct);
            try
            {
                if (db.Database.IsRelational())
                {
                    await db.Database.ExecuteSqlInterpolatedAsync(
                        $"SELECT id FROM classes WHERE id = {classId} FOR UPDATE", ct);
                }

                var cls = await db.Classes.FindAsync([classId], ct);
                if (cls is null)
                {
                    await tx.RollbackAsync(ct);
                    return (false, null, "Class not found", 404);
                }

                var now = DateTime.UtcNow;

                var activeStudentCount = await db.Holds
                    .Where(h => h.ClassId == classId && h.StudentId == studentId &&
                                (h.Status == HoldStatus.Confirmed ||
                                 (h.Status == HoldStatus.Held && h.ExpiresAt > now)))
                    .CountAsync(ct);

                if (activeStudentCount > 0)
                {
                    await tx.RollbackAsync(ct);
                    return (false, null,
                        "Student already has an active hold or confirmed admission in this class.", 409);
                }

                var confirmedSeats = await db.Holds
                    .Where(h => h.ClassId == classId && h.Status == HoldStatus.Confirmed)
                    .CountAsync(ct);

                var heldSeats = await db.Holds
                    .Where(h => h.ClassId == classId && h.Status == HoldStatus.Held && h.ExpiresAt > now)
                    .CountAsync(ct);

                if (confirmedSeats + heldSeats >= cls.TotalSeats)
                {
                    await tx.RollbackAsync(ct);
                    return (false, null, "Seat not available.", 409);
                }

                // expiresAt drives the UI timer; duration from HOLD_DURATION_SECONDS (.env)
                var hold = new HoldEntity
                {
                    Id = $"h_{Guid.NewGuid():N}"[..10],
                    ClassId = classId,
                    StudentId = studentId,
                    Status = HoldStatus.Held,
                    CreatedAt = now,
                    ExpiresAt = now.AddSeconds(HoldDuration.Resolve(configuration))
                };

                db.Holds.Add(hold);
                await db.SaveChangesAsync(ct);
                await tx.CommitAsync(ct);

                return (true, new Response(
                    hold.Id,
                    hold.ClassId,
                    hold.StudentId,
                    hold.Status,
                    UtcFormat.ToIsoZ(hold.ExpiresAt)), null, 201);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error creating hold for class {ClassId}", classId);
                await tx.RollbackAsync(ct);
                throw;
            }
        }
    }
}

[ApiController]
[Route("classes")]
[Tags("Holds")]
public sealed class CreateHoldEndpoint(CreateHold.Handler handler) : ControllerBase
{
    [HttpPost("{classId}/holds")]
    public async Task<IActionResult> Handle(
        string classId,
        [FromHeader(Name = "X-Student-Id")] string? studentId,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(classId))
        {
            return BadRequest(new ErrorResponse("Class ID is required."));
        }

        var normalized = StudentIdValidator.Normalize(studentId);
        if (normalized is null)
        {
            return BadRequest(new ErrorResponse(
                "Invalid or missing X-Student-Id header. Must be a 17-digit number."));
        }

        var (success, hold, error, statusCode) = await handler.Handle(classId, normalized, ct);
        return success
            ? StatusCode(statusCode, hold)
            : StatusCode(statusCode, new ErrorResponse(error ?? "Failed to create hold."));
    }
}
