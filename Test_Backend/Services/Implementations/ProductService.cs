using Test_Backend.Models.DTOs;
using Test_Backend.Models.Entities;
using Test_Backend.Repositories.Interfaces;
using Test_Backend.Services.Interfaces;

namespace Test_Backend.Services.Implementations
{
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ProductService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<CreateProductDTO> CreateProductAsync(CreateProductDTO createproductDto)
        {
            if (createproductDto.ImportPrice < 0 || createproductDto.SellingPrice < 0)
                throw new ArgumentException("Prices cannot be negative");

            if (createproductDto.TaxRate != 8 && createproductDto.TaxRate != 10)
                throw new ArgumentException("Tax rate must be either 8% or 10%");

            var productCode = await _unitOfWork.Products.GenerateProductCodeAsync();

            var product = new Product
            {
                ProductCode = productCode,
                Name = createproductDto.Name,
                Unit = createproductDto.Unit,
                ImportPrice = createproductDto.ImportPrice,
                SellingPrice = createproductDto.SellingPrice,
                IsActive = createproductDto.IsActive,
                TaxRate = createproductDto.TaxRate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Products.AddAsync(product);
            await _unitOfWork.SaveChangesAsync();
            return createproductDto;

        }

        public async Task<ProductDTO> UpdateProductAsync(string productCode, ProductDTO productDto)
        {
            if (productDto.ImportPrice < 0 || productDto.SellingPrice < 0)
                throw new ArgumentException("Prices cannot be negative");

            if (productDto.TaxRate != 8 && productDto.TaxRate != 10)
                throw new ArgumentException("Tax rate must be either 8% or 10%");

            var product = await _unitOfWork.Products.GetByIdAsync(productCode);
            if (product == null)
                throw new KeyNotFoundException($"Product with code {productCode} not found");

            product.Name = productDto.Name;
            product.Unit = productDto.Unit;
            product.ImportPrice = productDto.ImportPrice;
            product.SellingPrice = productDto.SellingPrice;
            product.TaxRate = productDto.TaxRate;
            product.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Products.Update(product);
            await _unitOfWork.SaveChangesAsync();

            return productDto;
        }

        public async Task DeleteProductAsync(string productCode)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(productCode);
            if (product == null)
                throw new KeyNotFoundException($"Product with code {productCode} not found");

            var hasOrders = await _unitOfWork.OrderItems.FindAsync(oi => oi.ProductCode == productCode);
            if (hasOrders.Any())
                throw new InvalidOperationException("Cannot delete product that is used in orders");

            _unitOfWork.Products.Delete(product);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task DeleteProductsAsync(List<string> productCodes)
        {
            var products = new List<Product>();
            foreach (var code in productCodes)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(code);
                if (product == null)
                    throw new KeyNotFoundException($"Product with code {code} not found");

                var hasOrders = await _unitOfWork.OrderItems.FindAsync(oi => oi.ProductCode == code);
                if (hasOrders.Any())
                    throw new InvalidOperationException($"Cannot delete product {code} that is used in orders");

                products.Add(product);
            }

            _unitOfWork.Products.DeleteRange(products);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<PagedResponse<ProductDTO>> GetProductsAsync(PagedRequest request)
        {
            var (products, totalCount) = await _unitOfWork.Products.GetPagedAsync(
                request.PageIndex,
                request.PageSize,
                    p => request.SearchTerm == null ||
                    p.Name.Contains(request.SearchTerm) ||
                    p.ProductCode.Contains(request.SearchTerm)
            );

            var productDtos = products.Select(p => new ProductDTO
            {
                ProductCode = p.ProductCode,
                Name = p.Name,
                Unit = p.Unit,
                ImportPrice = p.ImportPrice,
                SellingPrice = p.SellingPrice,
                IsActive = p.IsActive,
                TaxRate = p.TaxRate
            });

            return new PagedResponse<ProductDTO>
            {
                Items = productDtos,
                TotalCount = totalCount,
                PageIndex = request.PageIndex,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
            };
        }

        public async Task<bool> UpdateProductStatusAsync(string productCode, bool isActive)
        {
            return await _unitOfWork.Products.UpdateStatusAsync(productCode, isActive);
        }

        public async Task<IEnumerable<ProductDTO>> SearchProductsAsync(string searchTerm)
        {
            var products = await _unitOfWork.Products.SearchProductsAsync(searchTerm);
            return products.Select(p => new ProductDTO
            {
                ProductCode = p.ProductCode,
                Name = p.Name,
                Unit = p.Unit,
                ImportPrice = p.ImportPrice,
                SellingPrice = p.SellingPrice,
                IsActive = p.IsActive,
                TaxRate = p.TaxRate
            });
        }

        public async Task<ProductDTO> GetProductByCodeAsync(string productCode)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(productCode);
            if (product == null)
                throw new KeyNotFoundException($"Product with code {productCode} not found");

            return new ProductDTO
            {
                ProductCode = product.ProductCode,
                Name = product.Name,
                Unit = product.Unit,
                ImportPrice = product.ImportPrice,
                SellingPrice = product.SellingPrice,
                IsActive = product.IsActive,
                TaxRate = product.TaxRate
            };
        }
    }
}
