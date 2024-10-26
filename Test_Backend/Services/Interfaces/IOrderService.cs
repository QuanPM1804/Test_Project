using Test_Backend.Models.DTOs;

namespace Test_Backend.Services.Interfaces
{
    public interface IOrderService
    {
        Task<CreateOrderDTO> CreateOrderAsync(CreateOrderDTO createorderDto);
        Task<OrderDTO> UpdateOrderAsync(string orderCode, OrderDTO orderDto);
        Task<OrderDTO> GetOrderAsync(string orderCode);
        Task<IEnumerable<OrderDTO>> GetOrdersAsync();
    }
}
