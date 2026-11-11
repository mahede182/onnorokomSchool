using AdmissionSystem.Api.Common.Contracts;
using AdmissionSystem.Api.Common.Domain;
using AdmissionSystem.Api.Common.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace AdmissionSystem.Api.Features.Classes.CreateClass;

public static class CreateClass
{
    public sealed record Request(string Name, int TotalSeats);

    public sealed record Response(string Id, string Name, int TotalSeats);

    public sealed class Handler(AdmissionDbContext db)
    {
        public async Task<Response> Handle(Request request, CancellationToken ct)
        {
            var entity = new ClassEntity
            {
                Id = $"c_{Guid.NewGuid():N}"[..10],
                Name = request.Name.Trim(),
                TotalSeats = request.TotalSeats,
                CreatedAt = DateTime.UtcNow
            };

            db.Classes.Add(entity);
            await db.SaveChangesAsync(ct);
            return new Response(entity.Id, entity.Name, entity.TotalSeats);
        }
    }

    [ApiController]
    [Route("classes")]
    [Tags("Classes")]
    public sealed class Endpoint(Handler handler) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Handle([FromBody] Request request, CancellationToken ct)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new ErrorResponse("Class name is required."));
            }

            if (request.TotalSeats <= 0)
            {
                return BadRequest(new ErrorResponse("Total seats must be greater than 0."));
            }

            var result = await handler.Handle(request, ct);
            return StatusCode(StatusCodes.Status201Created, result);
        }
    }
}
