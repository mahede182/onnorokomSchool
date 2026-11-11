using AdmissionSystem.Api.Common.Domain;
using AdmissionSystem.Api.Common.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AdmissionSystem.Api.Features.Classes.Shared;

public static class ClassSeatQueries
{
    public static async Task<(int Held, int Confirmed, int Available)> GetSeatCountsAsync(
        AdmissionDbContext db,
        ClassEntity cls,
        DateTime now,
        CancellationToken ct = default)
    {
        var confirmed = await db.Holds
            .Where(h => h.ClassId == cls.Id && h.Status == HoldStatus.Confirmed)
            .CountAsync(ct);

        var held = await db.Holds
            .Where(h => h.ClassId == cls.Id && h.Status == HoldStatus.Held && h.ExpiresAt > now)
            .CountAsync(ct);

        var available = Math.Max(0, cls.TotalSeats - confirmed - held);
        return (held, confirmed, available);
    }

    public static async Task<ClassDetailDto> ToDetailAsync(
        AdmissionDbContext db,
        ClassEntity cls,
        DateTime now,
        CancellationToken ct = default)
    {
        var (held, confirmed, available) = await GetSeatCountsAsync(db, cls, now, ct);
        return new ClassDetailDto(cls.Id, cls.Name, cls.TotalSeats, held, confirmed, available);
    }
}

public record ClassDetailDto(
    string Id,
    string Name,
    int TotalSeats,
    int HeldSeats,
    int ConfirmedSeats,
    int AvailableSeats
);
