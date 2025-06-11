using Microsoft.AspNetCore.Mvc;

namespace Memoria_GDG.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetRoot()
        {
            return Ok("Welcome to the Memoria_GDG API!");
        }

        [HttpGet("health")]
        public IActionResult GetHealth()
        {
            return Ok(new { status = "Healthy" });
        }
    }
} 