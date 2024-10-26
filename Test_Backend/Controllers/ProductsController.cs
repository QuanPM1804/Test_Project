using Microsoft.AspNetCore.Mvc;
using Test_Backend.Models.DTOs;
using Test_Backend.Services.Interfaces;

namespace Test_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpPost]
        public async Task<ActionResult<CreateProductDTO>> CreateProduct([FromBody] CreateProductDTO createproductDto)
        {
            try
            {
                var result = await _productService.CreateProductAsync(createproductDto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{productCode}")]
        public async Task<ActionResult<ProductDTO>> UpdateProduct(string productCode, [FromBody] ProductDTO productDto)
        {
            try
            {
                var result = await _productService.UpdateProductAsync(productCode, productDto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{productCode}")]
        public async Task<ActionResult> DeleteProduct(string productCode)
        {
            try
            {
                await _productService.DeleteProductAsync(productCode);
                return NoContent();
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

        [HttpDelete("bulk")]
        public async Task<ActionResult> DeleteProducts([FromBody] List<string> productCodes)
        {
            try
            {
                await _productService.DeleteProductsAsync(productCodes);
                return NoContent();
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

        [HttpGet]
        public async Task<ActionResult<PagedResponse<ProductDTO>>> GetProducts([FromQuery] PagedRequest request)
        {
            var result = await _productService.GetProductsAsync(request);
            return Ok(result);
        }

        [HttpPatch("{productCode}/status")]
        public async Task<ActionResult> UpdateProductStatus(string productCode, [FromBody] bool isActive)
        {
            var result = await _productService.UpdateProductStatusAsync(productCode, isActive);
            if (!result)
                return NotFound($"Product with code {productCode} not found");

            return Ok();
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ProductDTO>>> SearchProducts([FromQuery] string searchTerm)
        {
            var results = await _productService.SearchProductsAsync(searchTerm);
            return Ok(results);
        }
    }
}
