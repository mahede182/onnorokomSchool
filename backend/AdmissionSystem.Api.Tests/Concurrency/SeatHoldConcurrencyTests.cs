using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AdmissionSystem.Api.Tests.Support;
using Xunit;

namespace AdmissionSystem.Api.Tests.Concurrency;

/*
Purpose:
Prove that concurrent hold requests cannot overbook a class (held + confirmed ≤ totalSeats).

Response:
Test asserts created holds ≤ totalSeats and GET /classes shows availableSeats ≥ 0.

Business Rules:
Assignment §1.6 — concurrency safety across simultaneous requests.

Flow:
1. Start Postgres testcontainer + WebApplicationFactory
2. Create a class with N seats
3. Fire 3N concurrent hold requests with unique student IDs
4. Count 201 responses and verify seat math

Side Effects:
Uses Docker for Testcontainers

Failure Cases:
Skipped/fails if Docker unavailable
*/
public class SeatHoldConcurrencyTests : IClassFixture<AdmissionApiFactory>
{
    private readonly AdmissionApiFactory _factory;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public SeatHoldConcurrencyTests(AdmissionApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ConcurrentHolds_DoNotExceedTotalSeats()
    {
        const int totalSeats = 5;
        var client = _factory.CreateClient();

        var createRes = await client.PostAsJsonAsync("/classes", new
        {
            name = "Concurrency Class – Morning",
            totalSeats
        });
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);

        var created = await createRes.Content.ReadFromJsonAsync<ClassCreated>(JsonOpts);
        Assert.NotNull(created);

        var tasks = Enumerable.Range(0, totalSeats * 3).Select(async i =>
        {
            var studentId = $"{i:D17}";
            using var req = new HttpRequestMessage(HttpMethod.Post, $"/classes/{created!.Id}/holds");
            req.Headers.Add("X-Student-Id", studentId);
            var res = await client.SendAsync(req);
            return res.StatusCode;
        });

        var statuses = await Task.WhenAll(tasks);
        var createdHolds = statuses.Count(s => s == HttpStatusCode.Created);
        var conflicts = statuses.Count(s => s == HttpStatusCode.Conflict);

        Assert.Equal(totalSeats, createdHolds);
        Assert.Equal(totalSeats * 2, conflicts);

        var listRes = await client.GetAsync("/classes");
        listRes.EnsureSuccessStatusCode();
        var classes = await listRes.Content.ReadFromJsonAsync<List<ClassDetail>>(JsonOpts);
        var cls = Assert.Single(classes!, c => c.Id == created.Id);

        Assert.True(cls.HeldSeats + cls.ConfirmedSeats <= cls.TotalSeats);
        Assert.Equal(0, cls.AvailableSeats);
        Assert.Equal(totalSeats, cls.HeldSeats);
    }

    private sealed record ClassCreated(string Id, string Name, int TotalSeats);

    private sealed record ClassDetail(
        string Id,
        string Name,
        int TotalSeats,
        int HeldSeats,
        int ConfirmedSeats,
        int AvailableSeats);
}
