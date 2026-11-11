using AdmissionSystem.Api.Common.Contracts;
using AdmissionSystem.Api.Common.Domain;
using AdmissionSystem.Api.Common.Persistence;
using AdmissionSystem.Api.Common.Validation;
using Microsoft.AspNetCore.Mvc;

namespace AdmissionSystem.Api.Features.Holds.CancelHold;

public static class CancelHold
{
    public sealed class Handler(AdmissionDbContext db)
    {
        public async Task<(bool Success, string? Error, int StatusCode)> Handle(
            string holdId,
            string studentId,
            CancellationToken ct)
        {
            var hold = await db.Holds.FindAsync([holdId], ct);
            if (hold is null)
            {
                return (false, "Hold not found.", 404);
            }

            if (hold.StudentId != studentId)
            {
                return (false, "Hold belongs to a different student.", 403);
            }

            if (hold.Status == HoldStatus.Confirmed)
            {
                return (false, "Confirmed admission cannot be cancelled via this endpoint.", 400);
            }

            if (hold.Status == HoldStatus.Held)
            {
                hold.Status = HoldStatus.Cancelled;
                await db.SaveChangesAsync(ct);
            }

            return (true, null, 204);
        }
    }
}

[ApiController]
[Route("holds")]
[Tags("Holds")]
public sealed class CancelHoldEndpoint(CancelHold.Handler handler) : ControllerBase
{
    [HttpDelete("{holdId}")]
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

        var (success, error, statusCode) = await handler.Handle(holdId, normalized, ct);
        return success
            ? NoContent()
            : StatusCode(statusCode, new ErrorResponse(error ?? "Failed to cancel hold."));
    }
}
