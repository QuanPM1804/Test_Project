using System.Net;
using System.Web.Http;
using Test_Backend.Models.DTOs;
using Test_Backend.Models.Entities;
using Test_Backend.Repositories.Interfaces;
using Test_Backend.Services.Interfaces;

namespace Test_Backend.Services.Implementations
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        public OrderService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<CreateOrderDTO> CreateOrderAsync(CreateOrderDTO createorderDto)
        {
            var orderCode = await _unitOfWork.Orders.GenerateOrderCodeAsync();

            decimal totalAmount = 0;
            decimal totalTax = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in createorderDto.OrderItems)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(item.ProductCode);
                if (product == null)
                    throw new HttpResponseException(HttpStatusCode.Forbidden);

                if (!product.IsActive)
                    throw new InvalidOperationException($"Product {item.ProductCode} is inactive");

                var sellingPrice = item.SellingPrice > 0 ? item.SellingPrice : product.SellingPrice;
                var linePrice = sellingPrice * item.Quantity;
                var taxAmount = linePrice * (product.TaxRate / 100);
                var lineAmount = linePrice - taxAmount;

                var orderItem = new OrderItem
                {
                    OrderCode = orderCode,
                    ProductCode = item.ProductCode,
                    Quantity = item.Quantity,
                    SellingPrice = sellingPrice,
                    TaxRate = product.TaxRate,
                    TaxAmount = taxAmount,
                    LineAmount = lineAmount
                };

                orderItems.Add(orderItem);
                totalAmount += lineAmount;
                totalTax += taxAmount;
            }

            var order = new Order
            {
                OrderCode = orderCode,
                CustomerName = createorderDto.CustomerName,
                CustomerPhone = createorderDto.CustomerPhone,
                TotalAmount = totalAmount,
                TotalTax = totalTax,
                CreatedAt = DateTime.UtcNow,
                OrderItems = orderItems
            };

            await _unitOfWork.Orders.AddAsync(order);
            await _unitOfWork.SaveChangesAsync();
            return createorderDto;
        }

        public async Task<OrderDTO> UpdateOrderAsync(string orderCode, OrderDTO orderDto)
        {
            var existingOrder = await _unitOfWork.Orders.GetOrderWithDetailsAsync(orderCode);
            if (existingOrder == null)
                throw new KeyNotFoundException($"Order with code {orderCode} not found");

            existingOrder.CustomerName = orderDto.CustomerName;
            existingOrder.CustomerPhone = orderDto.CustomerPhone;

            _unitOfWork.OrderItems.DeleteRange(existingOrder.OrderItems);

            decimal totalAmount = 0;
            decimal totalTax = 0;
            var newOrderItems = new List<OrderItem>();

            foreach (var item in orderDto.OrderItems)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(item.ProductCode);
                if (product == null)
                    throw new KeyNotFoundException($"Product with code {item.ProductCode} not found");

                if (!product.IsActive)
                    throw new InvalidOperationException($"Product {item.ProductCode} is inactive");

                var sellingPrice = item.SellingPrice > 0 ? item.SellingPrice : product.SellingPrice;
                var lineAmount = sellingPrice * item.Quantity;
                var taxAmount = lineAmount * (product.TaxRate / 100);

                var orderItem = new OrderItem
                {
                    OrderCode = orderCode,
                    ProductCode = item.ProductCode,
                    Quantity = item.Quantity,
                    SellingPrice = sellingPrice,
                    TaxRate = product.TaxRate,
                    TaxAmount = taxAmount,
                    LineAmount = lineAmount
                };

                newOrderItems.Add(orderItem);
                totalAmount += lineAmount;
                totalTax += taxAmount;
            }

            existingOrder.OrderItems = newOrderItems;
            existingOrder.TotalAmount = totalAmount;
            existingOrder.TotalTax = totalTax;

            _unitOfWork.Orders.Update(existingOrder);
            await _unitOfWork.SaveChangesAsync();

            return orderDto;
        }

        public async Task<OrderDTO> GetOrderAsync(string orderCode)
        {
            var order = await _unitOfWork.Orders.GetOrderWithDetailsAsync(orderCode);
            if (order == null)
                throw new KeyNotFoundException($"Order with code {orderCode} not found");

            return MapOrderToDto(order);
        }

        public async Task<IEnumerable<OrderDTO>> GetOrdersAsync()
        {
            var orders = await _unitOfWork.Orders.GetOrdersWithDetailsAsync();
            return orders.Select(MapOrderToDto);
        }

        private static OrderDTO MapOrderToDto(Order order)
        {
            return new OrderDTO
            {
                OrderCode = order.OrderCode,
                CustomerName = order.CustomerName,
                CustomerPhone = order.CustomerPhone,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDTO
                {
                    ProductCode = oi.ProductCode,
                    Quantity = oi.Quantity,
                    SellingPrice = oi.SellingPrice
                }).ToList()
            };
        }
    }
}
