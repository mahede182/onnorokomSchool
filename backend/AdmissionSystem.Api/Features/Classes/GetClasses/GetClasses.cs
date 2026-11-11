using AdmissionSystem.Api.Common.Persistence;
using AdmissionSystem.Api.Features.Classes.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdmissionSystem.Api.Features.Classes.GetClasses;

public static class GetClasses
{
    public sealed class Handler(AdmissionDbContext db)
    {
        public async Task<List<ClassDetailDto>> Handle(CancellationToken ct)
        {
            var now = DateTime.UtcNow;
            var classes = await db.Classes.OrderBy(c => c.CreatedAt).ToListAsync(ct);
            var result = new List<ClassDetailDto>(classes.Count);

            foreach (var cls in classes)
            {
                result.Add(await ClassSeatQueries.ToDetailAsync(db, cls, now, ct));
            }

            return result;
        }
    }
}

[ApiController]
[Route("classes")]
[Tags("Classes")]
public sealed class GetClassesEndpoint(GetClasses.Handler handler) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Handle(CancellationToken ct)
    {
        var classes = await handler.Handle(ct);
        return Ok(classes);
    }
}
