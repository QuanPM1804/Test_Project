using Test_Backend.Models.DTOs;

namespace Test_Backend.Services.Interfaces
{
    public interface IProductService
    {
        Task<CreateProductDTO> CreateProductAsync(CreateProductDTO createproductDto);
        Task<ProductDTO> UpdateProductAsync(string productCode, ProductDTO productDto);
        Task DeleteProductAsync(string productCode);
        Task DeleteProductsAsync(List<string> productCodes);
        Task<PagedResponse<ProductDTO>> GetProductsAsync(PagedRequest request);
        Task<bool> UpdateProductStatusAsync(string productCode, bool isActive);
        Task<IEnumerable<ProductDTO>> SearchProductsAsync(string searchTerm);
    }
}
