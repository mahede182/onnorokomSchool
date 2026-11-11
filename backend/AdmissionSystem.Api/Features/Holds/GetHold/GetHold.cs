using AdmissionSystem.Api.Common.Contracts;
using AdmissionSystem.Api.Common.Domain;
using AdmissionSystem.Api.Common.Persistence;
using AdmissionSystem.Api.Common.Time;
using Microsoft.AspNetCore.Mvc;

namespace AdmissionSystem.Api.Features.Holds.GetHold;

public static class GetHold
{
    public sealed record Response(string HoldId, string ClassId, string Status, string ExpiresAt);

    public sealed class Handler(AdmissionDbContext db)
    {
        public async Task<(bool Success, Response? Hold, string? Error, int StatusCode)> Handle(
            string holdId,
            CancellationToken ct)
        {
            var hold = await db.Holds.FindAsync([holdId], ct);
            if (hold is null)
            {
                return (false, null, "Hold not found.", 404);
            }

            var status = hold.Status;
            if (status == HoldStatus.Held && hold.ExpiresAt <= DateTime.UtcNow)
            {
                status = HoldStatus.Expired;
            }

            return (true, new Response(
                hold.Id,
                hold.ClassId,
                status,
                UtcFormat.ToIsoZ(hold.ExpiresAt)), null, 200);
        }
    }

    [ApiController]
    [Route("holds")]
    [Tags("Holds")]
    public sealed class Endpoint(Handler handler) : ControllerBase
    {
        [HttpGet("{holdId}")]
        public async Task<IActionResult> Handle(string holdId, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(holdId))
            {
                return BadRequest(new ErrorResponse("Hold ID is required."));
            }

            var (success, hold, error, statusCode) = await handler.Handle(holdId, ct);
            return success
                ? Ok(hold)
                : StatusCode(statusCode, new ErrorResponse(error ?? "Hold not found."));
        }
    }
}
