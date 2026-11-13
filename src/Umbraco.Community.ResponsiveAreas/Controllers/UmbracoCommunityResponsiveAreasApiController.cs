using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Umbraco.Community.ResponsiveAreas.Controllers
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "Umbraco.Community.ResponsiveAreas")]
    public class UmbracoCommunityResponsiveAreasApiController : UmbracoCommunityResponsiveAreasApiControllerBase
    {

        [HttpGet("ping")]
        [ProducesResponseType<string>(StatusCodes.Status200OK)]
        public string Ping() => "Pong";
    }
}
