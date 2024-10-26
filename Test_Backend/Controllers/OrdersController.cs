using Microsoft.AspNetCore.Mvc;
using Test_Backend.Models.DTOs;
using Test_Backend.Services.Interfaces;

namespace Test_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<ActionResult<CreateOrderDTO>> CreateOrder([FromBody] CreateOrderDTO createorderDto)
        {
            try
            {
                var result = await _orderService.CreateOrderAsync(createorderDto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{orderCode}")]
        public async Task<ActionResult<OrderDTO>> UpdateOrder(string orderCode, [FromBody] OrderDTO orderDto)
        {
            try
            {
                var result = await _orderService.UpdateOrderAsync(orderCode, orderDto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{orderCode}")]
        public async Task<ActionResult<OrderDTO>> GetOrder(string orderCode)
        {
            try
            {
                var result = await _orderService.GetOrderAsync(orderCode);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetOrders()
        {
            var results = await _orderService.GetOrdersAsync();
            return Ok(results);
        }
    }
}
