using System.ComponentModel.DataAnnotations;

namespace Test_Backend.Models.DTOs
{
    public class CreateOrderDTO
    {
        [Required]
        public string CustomerName { get; set; }
        [Required]
        public string CustomerPhone { get; set; }
        [Required]
        public List<OrderItemDTO> OrderItems { get; set; }
    }
}
