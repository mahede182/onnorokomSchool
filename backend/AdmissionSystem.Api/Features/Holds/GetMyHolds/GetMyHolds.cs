using AdmissionSystem.Api.Common.Contracts;
using AdmissionSystem.Api.Common.Domain;
using AdmissionSystem.Api.Common.Persistence;
using AdmissionSystem.Api.Common.Time;
using AdmissionSystem.Api.Common.Validation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdmissionSystem.Api.Features.Holds.GetMyHolds;

public static class GetMyHolds
{
    public sealed record Response(
        string HoldId,
        string ClassId,
        string ClassName,
        string Status,
        string ExpiresAt);

    public sealed class Handler(AdmissionDbContext db)
    {
        public async Task<List<Response>> Handle(string studentId, CancellationToken ct)
        {
            var now = DateTime.UtcNow;
            var holds = await db.Holds
                .Include(h => h.Class)
                .Where(h => h.StudentId == studentId)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync(ct);

            return holds.Select(h =>
            {
                var status = h.Status;
                if (status == HoldStatus.Held && h.ExpiresAt <= now)
                {
                    status = HoldStatus.Expired;
                }

                return new Response(
                    h.Id,
                    h.ClassId,
                    h.Class?.Name ?? string.Empty,
                    status,
                    UtcFormat.ToIsoZ(h.ExpiresAt));
            }).ToList();
        }
    }

    [ApiController]
    [Route("me")]
    [Tags("Me")]
    public sealed class Endpoint(Handler handler) : ControllerBase
    {
        [HttpGet("holds")]
        public async Task<IActionResult> Handle(
            [FromHeader(Name = "X-Student-Id")] string? studentId,
            CancellationToken ct)
        {
            var normalized = StudentIdValidator.Normalize(studentId);
            if (normalized is null)
            {
                return BadRequest(new ErrorResponse(
                    "Invalid or missing X-Student-Id header. Must be a 17-digit number."));
            }

            var holds = await handler.Handle(normalized, ct);
            return Ok(holds);
        }
    }
}
