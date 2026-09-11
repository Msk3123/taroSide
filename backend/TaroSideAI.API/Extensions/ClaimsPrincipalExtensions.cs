using System.Security.Claims;                                  
                                                                 
namespace TaroSideAI.API.Extensions;                           
                                                                 
public static class ClaimsPrincipalExtensions                  
{                                                              
    public static Guid? GetUserId(this ClaimsPrincipal user)   
    {                                                          
        var raw =                                              
            user.FindFirstValue(ClaimTypes.NameIdentifier);                
        return Guid.TryParse(raw, out var id) ? id : null;     
    }                                                          
}