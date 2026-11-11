using AdmissionSystem.Api.Common.Contracts;
using AdmissionSystem.Api.Common.Persistence;
using AdmissionSystem.Api.Features.Classes.Shared;
using Microsoft.AspNetCore.Mvc;

namespace AdmissionSystem.Api.Features.Classes.GetClassById;

public static class GetClassById
{
    public sealed class Handler(AdmissionDbContext db)
    {
        public async Task<ClassDetailDto?> Handle(string classId, CancellationToken ct)
        {
            var cls = await db.Classes.FindAsync([classId], ct);
            if (cls is null) return null;
            return await ClassSeatQueries.ToDetailAsync(db, cls, DateTime.UtcNow, ct);
        }
    }
}

[ApiController]
[Route("classes")]
[Tags("Classes")]
public sealed class GetClassByIdEndpoint(GetClassById.Handler handler) : ControllerBase
{
    [HttpGet("{classId}")]
    public async Task<IActionResult> Handle(string classId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(classId))
        {
            return BadRequest(new ErrorResponse("Invalid class ID."));
        }

        var cls = await handler.Handle(classId, ct);
        return cls is null
            ? NotFound(new ErrorResponse("Class not found."))
            : Ok(cls);
    }
}
