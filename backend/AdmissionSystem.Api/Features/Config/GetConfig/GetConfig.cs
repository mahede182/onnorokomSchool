using AdmissionSystem.Api.Common.Config;
using Microsoft.AspNetCore.Mvc;

namespace AdmissionSystem.Api.Features.Config.GetConfig;

public static class GetConfig
{
    public sealed record Response(int HoldDurationSeconds);

    public sealed class Handler(IConfiguration configuration)
    {
        /*
        Purpose:
        Relay server hold settings so the UI timer matches .env without a Vite duplicate.

        Response:
        { holdDurationSeconds }

        Business Rules:
        - Same HOLD_DURATION_SECONDS used when creating holds

        Flow:
        1. Resolve duration via HoldDuration
        2. Return response

        Side Effects:
        None

        Failure Cases:
        None
        */
        public Response Handle() =>
            new(HoldDuration.Resolve(configuration));
    }
}

[ApiController]
[Route("config")]
[Tags("Config")]
public sealed class GetConfigEndpoint(GetConfig.Handler handler) : ControllerBase
{
    [HttpGet]
    public IActionResult Handle() => Ok(handler.Handle());
}
